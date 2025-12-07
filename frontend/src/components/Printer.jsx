import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const Printer = ({ stickerImage, loading, onStickerReady }) => {
  console.log("Printer: Rendered with:", { hasStickerImage: !!stickerImage, loading, hasCallback: !!onStickerReady });

  useEffect(() => {
    console.log("Printer: stickerImage changed:", !!stickerImage);
    if (stickerImage && onStickerReady && !loading) {
      // Fallback: if animation doesn't complete within 5 seconds, call callback anyway
      const timeout = setTimeout(() => {
        console.log("Printer: Fallback timeout - calling onStickerReady");
        onStickerReady();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [stickerImage, onStickerReady, loading]);
  return (
    <div className="printer-container">
      {/* The Machine Visual */}
      <motion.div
        className="printer-body"
        animate={loading ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: loading ? Infinity : 0 }}
      >
        <div className="printer-slot">
          {loading && (
            <motion.div
              className="printing-beam"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                pointerEvents: "none"
              }}
            />
          )}
        </div>
        <div className="printer-lights">
            <span className={loading ? "light blink" : "light ready"}></span>
        </div>
      </motion.div>

      {/* The Sticker Sliding Out */}
      <div className="paper-exit-zone">
        <AnimatePresence mode="wait">
          {stickerImage && (
            <motion.div
              key={stickerImage}
              initial={{ y: -100, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1
              }}
              exit={{ y: 120, opacity: 0, scale: 0.8, transition: { duration: 0.8 } }}
              transition={{
                duration: 2,
                type: "spring",
                bounce: 0.3,
                delay: loading ? 1 : 0
              }}
              onAnimationComplete={() => {
                console.log("Printer: Animation completed! Calling onStickerReady");
                // Notify parent that sticker animation is complete
                if (onStickerReady) {
                  console.log("Printer: onStickerReady exists, calling it");
                  setTimeout(() => {
                    console.log("Printer: Executing onStickerReady callback");
                    onStickerReady();
                  }, 500); // Small delay before adding to collection
                } else {
                  console.log("Printer: onStickerReady callback missing");
                }
              }}
              style={{
                display: "flex",
                justifyContent: "center"
              }}
            >
              <motion.img
                src={stickerImage}
                alt="New Sticker"
                className="fresh-sticker"
                initial={{ filter: "blur(2px)" }}
                animate={{
                  filter: "blur(0px)",
                  y: [0, -3, 0],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{
                  filter: { duration: 0.5, delay: 1 },
                  y: { duration: 3, repeat: Infinity, repeatDelay: 2 },
                  rotate: { duration: 4, repeat: Infinity, repeatDelay: 2 }
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Printer;