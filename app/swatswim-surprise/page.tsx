"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./surprise.css";

const photoUrl =
  "https://images.sidearmdev.com/resize?url=https%3A%2F%2Fdxbhsrqyrr690.cloudfront.net%2Fsidearm.nextgen.sites%2Fswarthmoreathletics.com%2Fimages%2F2026%2F10%2F22%2FHeese_HS.png&width=1000&type=webp&quality=100";

const colors = ["#ff4678", "#ffcf45", "#55e6c1", "#78a7ff", "#cf7cff", "#ffffff"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 100 }, (_, index) => ({
        id: index,
        left: `${(index * 37.17) % 100}%`,
        delay: `${(index % 18) * -0.27}s`,
        duration: `${4.2 + (index % 9) * 0.42}s`,
        color: colors[index % colors.length],
        rotate: `${(index * 53) % 360}deg`,
      })),
    []
  );

  return (
    <div className="surprise-confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <i
          key={piece.id}
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            rotate: piece.rotate,
          }}
        />
      ))}
    </div>
  );
}

function Fireworks() {
  return (
    <div className="fireworks" aria-hidden="true">
      <div className="firework firework-one" />
      <div className="firework firework-two" />
      <div className="firework firework-three" />
      <div className="firework firework-four" />
    </div>
  );
}

export default function SwatSwimSurprisePage() {
  const [password, setPassword] = useState("");
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.trim().toLowerCase() === "men") {
      setRevealed(true);
      return;
    }
    setWrongAnswer(true);
  }

  return (
    <section className="surprise-page">
      <div className="surprise-orb surprise-orb-one" />
      <div className="surprise-orb surprise-orb-two" />
      <div className="surprise-stars" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="lock"
            className="surprise-lock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="lock-sparkle"
              animate={{ rotate: 360, scale: [1, 1.14, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            >
              ✦
            </motion.div>
            <p className="surprise-kicker">TOP SECRET SWATSWIM FILE</p>
            <h1>A tiny surprise is waiting.</h1>
            <p className="surprise-hint">Password hint: what do you smell?</p>
            <form onSubmit={submit} className="surprise-form">
              <label htmlFor="surprise-password">Password</label>
              <input
                id="surprise-password"
                type="password"
                autoFocus
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setWrongAnswer(false);
                }}
                aria-describedby={wrongAnswer ? "password-error" : undefined}
                className={wrongAnswer ? "wrong" : ""}
                placeholder="Enter the secret word"
              />
              {wrongAnswer && (
                <p id="password-error" className="password-error">
                  Not quite — take another whiff. ✨
                </p>
              )}
              <button type="submit">Unlock the surprise <span>→</span></button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            className="surprise-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <Fireworks />
            <Confetti />
            <motion.p
              className="reveal-eyebrow"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              ✦ THE BIG QUESTION ✦
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.6, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 210, damping: 14, delay: 0.35 }}
            >
              Will you go to Hoco with me, Chris?
            </motion.h1>
            <motion.div
              className="photo-frame"
              initial={{ opacity: 0, scale: 0.55, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ type: "spring", stiffness: 160, damping: 13, delay: 0.65 }}
            >
              <span className="frame-star star-a">✦</span>
              <span className="frame-star star-b">★</span>
              <span className="frame-star star-c">✦</span>
              {/* Remote image is intentionally an img so this one-off URL needs no image optimizer config. */}
              <img src={photoUrl} alt="Chris" />
            </motion.div>
            <motion.p
              className="reveal-note"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
            >
              Say yes and let&apos;s make it legendary. 💫
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
