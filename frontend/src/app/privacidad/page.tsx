export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-gray-500 text-sm mb-8">Última actualización: 1 de marzo de 2026</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-gray-700">
          {[
            { title: '1. Información que recopilamos', content: 'Recopilamos información que nos proporcionás directamente (nombre, email, dirección, teléfono), información de tus transacciones (compras, ventas, pagos), datos de uso de la Plataforma y datos del dispositivo.' },
            { title: '2. Uso de la información', content: 'Utilizamos tu información para: procesar transacciones, mejorar nuestros servicios, enviarte notificaciones relevantes, prevenir fraudes y cumplir con obligaciones legales.' },
            { title: '3. Compartir información', content: 'No vendemos ni compartimos tu información personal con terceros para fines comerciales. Compartimos datos únicamente con: (a) el otro usuario de la transacción (nombre y ciudad); (b) empresas de logística para el envío; (c) procesadores de pago; (d) autoridades cuando sea requerido por ley.' },
            { title: '4. Cookies', content: 'Usamos cookies para mejorar tu experiencia, recordar tus preferencias y analizar el tráfico. Podés configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.' },
            { title: '5. Seguridad', content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo encriptación SSL, almacenamiento seguro de contraseñas y acceso restringido a datos personales.' },
            { title: '6. Tus derechos', content: 'Tenés derecho a: acceder a tus datos personales, rectificarlos, solicitar su eliminación, oponerte a su tratamiento, solicitar la portabilidad de tus datos. Para ejercer estos derechos, contactanos a privacidad@mercadosimple.com.ar.' },
            { title: '7. Menores de edad', content: 'La Plataforma está destinada a mayores de 18 años. No recopilamos intencionalmente información de menores. Si detectamos que un menor ha registrado una cuenta, la eliminaremos inmediatamente.' },
            { title: '8. Cambios a esta política', content: 'Podemos actualizar esta política periódicamente. Los cambios serán notificados por email o mediante aviso en la Plataforma.' },
          ].map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
              <p className="leading-relaxed">{section.content}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            <p>Para consultas sobre privacidad: privacidad@mercadosimple.com.ar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
