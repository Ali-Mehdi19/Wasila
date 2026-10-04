// Helpdesk page: one conversation for typed and spoken questions.
// Typed questions are sent without a page reload, so a running avatar session survives.
// When the avatar is connected it speaks every answer; the answers always come from
// Wasila's Python backend, never from LiveAvatar's own AI.

(() => {
  const app = document.getElementById("helpdesk");
  if (!app) return;
  const $ = (id) => document.getElementById(id);
  const log = $("chat-log");
  const composer = $("composer");
  const input = $("question");

  let room = null; // LiveKit room while the avatar is connected
  let avatarSpeaking = false;
  let queue = Promise.resolve(); // questions are answered one at a time, in order

  // ---------- conversation ----------

  function post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": app.dataset.csrf },
      body: JSON.stringify(body || {}),
    });
  }

  function scrollToEnd(el) {
    el.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function addUserBubble(text) {
    $("welcome")?.remove();
    const row = document.createElement("div");
    row.className = "msg msg-user";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text; // plain text, never HTML
    row.appendChild(bubble);
    log.appendChild(row);
    scrollToEnd(row);
  }

  function addThinking() {
    const row = document.createElement("div");
    row.className = "msg msg-bot thinking";
    row.innerHTML =
      '<div class="avatar" aria-hidden="true">و</div>' +
      '<div class="bubble"><span class="dots"><i></i><i></i><i></i></span></div>';
    log.appendChild(row);
    scrollToEnd(row);
    return row;
  }

  function ask(question) {
    question = question.trim();
    if (!question) return;
    addUserBubble(question);
    queue = queue.then(async () => {
      const thinking = addThinking();
      if (room) setStatus("thinking", "Thinking…");
      try {
        const res = await post(app.dataset.askUrl, { question, voice: Boolean(room) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        thinking.outerHTML = data.html; // rendered and escaped by the server
        scrollToEnd(log.lastElementChild);
        if (room && data.speech) send("avatar.speak_text", { text: data.speech });
      } catch (err) {
        console.error(err);
        thinking.classList.remove("thinking");
        thinking.querySelector(".bubble").textContent = "Sorry, something went wrong. Please try again.";
      } finally {
        if (room) setStatus("listening", "Listening");
      }
    });
  }

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      composer.requestSubmit();
    }
  });

  document.querySelectorAll(".suggestions .chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      ask(chip.value);
    });
  });

  // ---------- avatar ----------

  const startBtn = $("start-btn");
  if (!startBtn || !window.LivekitClient) return; // avatar not configured

  const { Room, RoomEvent, Track } = window.LivekitClient;
  const COMMAND_TOPIC = "agent-control";
  const RESPONSE_TOPIC = "agent-response";
  const video = $("avatar-video");
  const audio = $("avatar-audio");
  const overlay = $("overlay");
  const overlayText = $("overlay-text");
  const status = $("status");
  const micBtn = $("mic-btn");
  const stopBtn = $("stop-btn");

  function setStatus(state, text) {
    status.dataset.state = state;
    status.textContent = text;
  }

  function send(eventType, extra) {
    if (!room) return;
    const payload = { event_id: crypto.randomUUID(), event_type: eventType, ...extra };
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(payload)), {
      reliable: true,
      topic: COMMAND_TOPIC,
    });
  }

  function onAgentEvent(event) {
    switch (event.event_type) {
      case "user.speak_started":
        setStatus("hearing", "Hearing you…");
        if (avatarSpeaking) send("avatar.interrupt"); // let the member cut in
        break;
      case "user.transcription":
        if (event.text) ask(event.text);
        break;
      case "avatar.speak_started":
        avatarSpeaking = true;
        setStatus("speaking", "Speaking");
        break;
      case "avatar.speak_ended":
        avatarSpeaking = false;
        setStatus("listening", "Listening");
        break;
      case "session.stopped":
        endUi(
          event.end_reason === "MAX_DURATION_REACHED"
            ? "The spoken session reached its time limit. You can keep typing, or start again."
            : "The spoken session has ended. You can keep typing."
        );
        break;
    }
  }

  async function start() {
    startBtn.disabled = true;
    setStatus("connecting", "Connecting…");
    overlayText.textContent = "Connecting to Wasila…";
    try {
      const res = await post(app.dataset.startUrl);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newRoom = new Room({ adaptiveStream: true, dynacast: true });
      newRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          track.attach(video);
          overlay.hidden = true;
        } else if (track.kind === Track.Kind.Audio) {
          track.attach(audio);
        }
      });
      newRoom.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
        if (topic !== RESPONSE_TOPIC) return;
        try {
          onAgentEvent(JSON.parse(new TextDecoder().decode(payload)));
        } catch (e) {
          console.warn("Unreadable avatar event", e);
        }
      });
      newRoom.on(RoomEvent.Disconnected, () => {
        if (room === newRoom) endUi("The spoken session has ended. You can keep typing.");
      });

      await newRoom.connect(data.livekit_url, data.livekit_token);
      room = newRoom;

      let micOn = true;
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (micErr) {
        // Blocked or missing microphone: the member can still type and hear the answers.
        console.warn("Microphone unavailable", micErr);
        micOn = false;
      }

      setStatus("listening", micOn ? "Listening" : "Mic off – type your question");
      startBtn.hidden = true;
      micBtn.hidden = !micOn;
      stopBtn.hidden = false;
      send("avatar.speak_text", {
        text: "Salaam! I'm Wasila, the Jamaat helpdesk. How can I help you today?",
      });
    } catch (err) {
      console.error(err);
      await stop();
      endUi((err && err.message) || "Could not connect. Please try again.");
    }
  }

  async function stop() {
    const current = room;
    room = null;
    if (current) await current.disconnect();
    await post(app.dataset.stopUrl).catch(() => {});
  }

  function endUi(message) {
    room = null;
    avatarSpeaking = false;
    setStatus("idle", "Not connected");
    overlay.hidden = false;
    overlayText.textContent = message;
    startBtn.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = "Start again";
    micBtn.hidden = true;
    stopBtn.hidden = true;
  }

  startBtn.addEventListener("click", start);

  stopBtn.addEventListener("click", async () => {
    await stop();
    endUi("The spoken session has ended. You can keep typing.");
  });

  micBtn.addEventListener("click", async () => {
    if (!room) return;
    const on = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(on);
    micBtn.textContent = on ? "Mute mic" : "Unmute mic";
    micBtn.setAttribute("aria-pressed", String(on));
  });

  // Free the session (and its credits) if the member leaves the page.
  window.addEventListener("pagehide", () => {
    if (!room) return;
    const form = new FormData();
    form.append("csrf", app.dataset.csrf);
    navigator.sendBeacon(app.dataset.stopUrl, form);
  });
})();
