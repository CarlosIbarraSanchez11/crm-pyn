import { FaWhatsapp } from 'react-icons/fa6'

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/51998179223"
      target="_blank"
      className="wsp-animation fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-2xl"
    >
      <FaWhatsapp size={30} />
    </a>
  )
}