export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Términos y Condiciones</h1>
        <p className="text-gray-500 text-sm mb-8">Última actualización: 1 de marzo de 2026</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-gray-700">
          {[
            { title: '1. Aceptación de los Términos', content: 'Al acceder y utilizar Mercado Simple (en adelante "la Plataforma"), aceptás quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, no debés utilizar la Plataforma. Mercado Simple es una plataforma de comercio electrónico que conecta compradores y vendedores en Argentina.' },
            { title: '2. Uso de la Plataforma', content: 'Podés utilizar la Plataforma únicamente para fines lícitos y de acuerdo con estos Términos. Queda prohibido: (a) publicar productos falsos o engañosos; (b) utilizar la Plataforma para actividades ilegales; (c) interferir con el funcionamiento normal de la Plataforma; (d) recopilar datos de usuarios sin consentimiento.' },
            { title: '3. Registro de Cuenta', content: 'Para acceder a todas las funcionalidades, debés crear una cuenta. Sos responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas desde tu cuenta. Debés notificarnos inmediatamente sobre cualquier uso no autorizado.' },
            { title: '4. Compraventa', content: 'Mercado Simple actúa como intermediario entre compradores y vendedores. Las transacciones se realizan entre usuarios y la Plataforma no es parte de los contratos de compraventa. Sin embargo, ofrecemos Compra Protegida para garantizar que las operaciones se realicen correctamente.' },
            { title: '5. Pagos y Comisiones', content: 'Los vendedores pagan una comisión por cada venta realizada a través de la Plataforma. Los compradores no pagan comisiones adicionales. Los pagos se procesan a través de nuestra Billetera Virtual o pasarelas de pago habilitadas.' },
            { title: '6. Privacidad', content: 'El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, que es parte integrante de estos Términos. Al usar la Plataforma, aceptás el tratamiento de tus datos conforme a dicha política.' },
            { title: '7. Propiedad Intelectual', content: 'Todo el contenido de la Plataforma, incluyendo logos, diseños, textos e interfaces, es propiedad de Mercado Simple o sus licenciantes. Queda prohibida su reproducción o uso sin autorización expresa.' },
            { title: '8. Limitación de Responsabilidad', content: 'Mercado Simple no será responsable por daños indirectos, incidentales o consecuentes. Nuestra responsabilidad máxima no superará el monto pagado por el usuario en los últimos 12 meses.' },
            { title: '9. Modificaciones', content: 'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios serán notificados con al menos 15 días de anticipación. El uso continuado de la Plataforma implica la aceptación de los nuevos términos.' },
            { title: '10. Jurisdicción', content: 'Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia será sometida a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.' },
          ].map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
              <p className="leading-relaxed">{section.content}</p>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            <p>Mercado Simple S.R.L. – CUIT: 30-XXXXXXXXX-X</p>
            <p>Av. Corrientes 1234, Piso 5, Ciudad Autónoma de Buenos Aires</p>
            <p>Contacto: legal@mercadosimple.com.ar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
