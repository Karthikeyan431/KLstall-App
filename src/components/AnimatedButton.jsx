import { motion } from "framer-motion";

export default function AnimatedButton({
  children,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
