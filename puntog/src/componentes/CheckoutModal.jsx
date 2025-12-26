import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ContactForm from "./ContactForm";

export default function CheckoutModal({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-neutral-900 w-full max-w-2xl rounded-2xl p-6 md:p-10 shadow-2xl relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-pink-400"
          >
            <X size={26} />
          </button>

          <h2 className="text-2xl font-semibold text-pink-400 mb-6">
            Finalizar pedido
          </h2>

          {/* 👇 cerrará el modal cuando el formulario sea exitoso */}
          <ContactForm onSuccess={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// import { motion, AnimatePresence } from "framer-motion";
// import { X } from "lucide-react";
// import ContactForm from "./ContactForm";

// export default function CheckoutModal({ open, onClose }) {
//   if (!open) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           className="bg-neutral-900 w-full max-w-2xl rounded-2xl p-6 md:p-10 shadow-2xl relative"
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//         >
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-white/70 hover:text-pink-400"
//           >
//             <X size={26} />
//           </button>

//           <h2 className="text-2xl font-semibold text-pink-400 mb-6">
//             Finalizar pedido
//           </h2>

//           <ContactForm onSuccess={onClose} />
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
