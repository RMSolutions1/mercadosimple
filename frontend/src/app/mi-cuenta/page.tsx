'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, Heart, MessageCircle, Shield, MapPin, Settings, Bell,
  Wallet, ArrowUpRight, ArrowDownLeft, Send, History, QrCode, TrendingUp,
  Building2, ChevronRight, LogOut, Menu, X, Star, Plus, Minus,
  Copy, CheckCircle, RefreshCw, CreditCard, Phone, Zap, Droplets,
  Flame, Wifi, Tv, Smartphone, ArrowUp, Lock, Eye, EyeOff, Trash2,
  FileText, AlertCircle, Store, DollarSign, Download, Share2, Clock, Loader2, Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useWalletStore } from '@/store/wallet.store';
import { SolMayo } from '@/components/ui/SolMayo';
import { formatPrice, formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Tab = 'resumen' | 'billetera' | 'depositar' | 'transferir' | 'retirar' | 'historial' | 'qr' | 'servicios' | 'pedidos' | 'perfil' | 'favoritos' | 'mensajes' | 'seguridad' | 'direcciones' | 'configuracion' | 'notificaciones';

// ── Catálogo completo de servicios basado en rubros de Rapipago/PagoFácil ──
const SERVICE_CATEGORIES = [
  { id: 'luz',        label: 'Electricidad',       icon: Zap,          color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'gas',        label: 'Gas',                icon: Flame,        color: '#EF4444', bg: '#FEE2E2' },
  { id: 'agua',       label: 'Agua',               icon: Droplets,     color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'internet',   label: 'Internet',           icon: Wifi,         color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'celular',    label: 'Celular / Recarga',  icon: Smartphone,   color: '#10B981', bg: '#D1FAE5' },
  { id: 'tv',         label: 'TV / Cable',          icon: Tv,           color: '#6B7280', bg: '#F3F4F6' },
  { id: 'telefono',   label: 'Telefonía fija',      icon: Phone,        color: '#0891B2', bg: '#ECFEFF' },
  { id: 'tarjetas',   label: 'Tarjetas de crédito', icon: CreditCard,   color: '#1D4ED8', bg: '#DBEAFE' },
  { id: 'transporte', label: 'Transporte / SUBE',   icon: ArrowUpRight, color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'billetera',  label: 'Billeteras virtuales', icon: Wallet,      color: '#6366F1', bg: '#EEF2FF' },
  { id: 'prepaga',    label: 'Prepagas médicas',    icon: Shield,       color: '#EC4899', bg: '#FDF2F8' },
  { id: 'educacion',  label: 'Educación',           icon: Star,         color: '#F97316', bg: '#FFF7ED' },
  { id: 'municipal',  label: 'Impuestos / AFIP',    icon: Building2,    color: '#92400E', bg: '#FEF9C3' },
  { id: 'seguros',    label: 'Seguros',             icon: CheckCircle,  color: '#059669', bg: '#D1FAE5' },
  { id: 'juegos',     label: 'Lotería / Juegos',    icon: DollarSign,   color: '#DC2626', bg: '#FEE2E2' },
];

const SERVICES_BY_CAT: Record<string, { name: string; code: string; logo: string; modes: string[]; inputLabel: string; rechargeAmounts?: number[] }[]> = {
  // ── ELECTRICIDAD ──
  luz: [
    { name: 'Edenor',               code: 'EDN',  logo: '⚡', modes: ['Factura', 'NIS'],       inputLabel: 'Número de suministro (NIS)' },
    { name: 'Edesur',               code: 'EDS',  logo: '⚡', modes: ['Factura', 'NIS'],       inputLabel: 'Número de suministro (NIS)' },
    { name: 'Edelap',               code: 'ELP',  logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EPEC (Córdoba)',        code: 'EPC',  logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EPE Santa Fe',          code: 'EPEF', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EDEN (Bs As Norte)',    code: 'EDNN', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EDES (Bs As Sur)',      code: 'EDNS', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EPSA (San Luis)',       code: 'EPSA', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EMSE (San Juan)',       code: 'EMSE', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EDEMSA (Mendoza)',      code: 'EDMS', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EDEA (Mar del Plata)',  code: 'EDEA', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'EPNE (Neuquén)',        code: 'EPNE', logo: '⚡', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
  ],
  // ── GAS ──
  gas: [
    { name: 'Metrogas',             code: 'MTG',  logo: '🔥', modes: ['Factura', 'Cuenta'],   inputLabel: 'Número de cuenta' },
    { name: 'Naturgy / BAN',        code: 'NAT',  logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Litoral Gas',          code: 'LTG',  logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Gasnor',               code: 'GSN',  logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Camuzzi Gas Pampeana', code: 'CMZ',  logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Camuzzi Gas del Sur',  code: 'CMZS', logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Gasnea',               code: 'GNE',  logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Gas CUYANA',           code: 'GCU',  logo: '🔥', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
  ],
  // ── AGUA ──
  agua: [
    { name: 'AySA (AMBA)',          code: 'AYSA', logo: '💧', modes: ['Factura', 'OSN'],       inputLabel: 'Número de OSN' },
    { name: 'ABSA (Pcia Bs As)',    code: 'ABSA', logo: '💧', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'ASSA (Santa Fe)',      code: 'ASSA', logo: '💧', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Aguas Cordobesas',     code: 'AGC',  logo: '💧', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'OSSE (Mar del Plata)', code: 'OSSE', logo: '💧', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Aguas de Corrientes',  code: 'ACO',  logo: '💧', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
    { name: 'Obras San. Mendoza',   code: 'OSM',  logo: '💧', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
  ],
  // ── INTERNET ──
  internet: [
    { name: 'Fibertel / Claro Hogar', code: 'FBT', logo: '🌐', modes: ['Factura'],             inputLabel: 'Número de cliente' },
    { name: 'Telecentro',            code: 'TLC',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Arnet / Telecom',       code: 'ARN',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Speedy (Telefónica)',   code: 'SPD',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Personal Flow',         code: 'PFL',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Cablevisión',           code: 'CBV',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Inter (Interspeed)',    code: 'INT',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cliente' },
    { name: 'Starlink Argentina',    code: 'STR',  logo: '🌐', modes: ['Factura'],              inputLabel: 'Número de cuenta' },
  ],
  // ── CELULAR / RECARGAS ──
  celular: [
    { name: 'Personal — Recarga',   code: 'PERP', logo: '📱', modes: ['Recarga'], inputLabel: 'Número de celular (sin 0)', rechargeAmounts: [100, 200, 300, 500, 1000, 1500, 2000] },
    { name: 'Claro — Recarga',      code: 'CLRP', logo: '📱', modes: ['Recarga'], inputLabel: 'Número de celular (sin 0)', rechargeAmounts: [100, 200, 300, 500, 1000, 1500, 2000] },
    { name: 'Movistar — Recarga',   code: 'MOVP', logo: '📱', modes: ['Recarga'], inputLabel: 'Número de celular (sin 0)', rechargeAmounts: [100, 200, 300, 500, 1000, 1500, 2000] },
    { name: 'Tuenti — Recarga',     code: 'TUE',  logo: '📱', modes: ['Recarga'], inputLabel: 'Número de celular (sin 0)', rechargeAmounts: [100, 200, 300, 500, 1000] },
    { name: 'Personal — Factura',   code: 'PER',  logo: '📱', modes: ['Factura'], inputLabel: 'Número de cuenta de cliente' },
    { name: 'Claro — Factura',      code: 'CLR',  logo: '📱', modes: ['Factura'], inputLabel: 'Número de cuenta de cliente' },
    { name: 'Movistar — Factura',   code: 'MOV',  logo: '📱', modes: ['Factura'], inputLabel: 'Número de cuenta de cliente' },
  ],
  // ── TV / CABLE ──
  tv: [
    { name: 'DirecTV / Star+',      code: 'DTV',  logo: '📺', modes: ['Factura'], inputLabel: 'Número de cuenta (10 dígitos)' },
    { name: 'Cablevisión / Flow',   code: 'CBV',  logo: '📺', modes: ['Factura'], inputLabel: 'Número de cliente' },
    { name: 'Telecentro',           code: 'TCA',  logo: '📺', modes: ['Factura'], inputLabel: 'Número de cliente' },
    { name: 'Supercanal',           code: 'SPC',  logo: '📺', modes: ['Factura'], inputLabel: 'Número de cliente' },
    { name: 'Antina / Arsat',       code: 'ANT',  logo: '📺', modes: ['Factura'], inputLabel: 'Número de cliente' },
    { name: 'DirecTV Prepago',      code: 'DTVP', logo: '📺', modes: ['Recarga'], inputLabel: 'Número de tarjeta / cuenta', rechargeAmounts: [500, 1000, 2000, 3000] },
  ],
  // ── TELEFONÍA FIJA ──
  telefono: [
    { name: 'Telecom / Personal fija', code: 'TEL', logo: '☎️', modes: ['Factura'], inputLabel: 'Número de línea' },
    { name: 'Telefónica / Movistar fija', code: 'TEF', logo: '☎️', modes: ['Factura'], inputLabel: 'Número de línea' },
    { name: 'Arnet (DSL)',           code: 'ARNT', logo: '☎️', modes: ['Factura'], inputLabel: 'Número de cliente' },
  ],
  // ── TARJETAS DE CRÉDITO ──
  tarjetas: [
    { name: 'Naranja / Naranja X',  code: 'NRJ',  logo: '🟠', modes: ['Factura'], inputLabel: 'N° de tarjeta (16 dígitos)' },
    { name: 'VISA Argentina',       code: 'VISA', logo: '🔵', modes: ['Factura'], inputLabel: 'N° de tarjeta o cuenta' },
    { name: 'Mastercard',           code: 'MSTR', logo: '🔴', modes: ['Factura'], inputLabel: 'N° de tarjeta o cuenta' },
    { name: 'American Express',     code: 'AMEX', logo: '🟦', modes: ['Factura'], inputLabel: 'N° de tarjeta (15 dígitos)' },
    { name: 'Cabal',                code: 'CBL',  logo: '🟢', modes: ['Factura'], inputLabel: 'N° de tarjeta o cuenta' },
    { name: 'Diners Club',          code: 'DIN',  logo: '⚫', modes: ['Factura'], inputLabel: 'N° de tarjeta (14 dígitos)' },
    { name: 'Tarjeta Shopping',     code: 'SHP',  logo: '🛍️', modes: ['Factura'], inputLabel: 'N° de cuenta' },
    { name: 'Tarjeta Cencosud',     code: 'CEN',  logo: '🏬', modes: ['Factura'], inputLabel: 'N° de cuenta' },
    { name: 'Tarjeta Carrefour',    code: 'CAR',  logo: '🛒', modes: ['Factura'], inputLabel: 'N° de cuenta' },
    { name: 'Tarjeta Walmart',      code: 'WAL',  logo: '🟡', modes: ['Factura'], inputLabel: 'N° de cuenta' },
    { name: 'CMR Falabella',        code: 'CMR',  logo: '🏪', modes: ['Factura'], inputLabel: 'N° de cuenta' },
    { name: 'Tarjeta Nativa (BBVA)', code: 'NTV', logo: '🔷', modes: ['Factura'], inputLabel: 'N° de cuenta' },
  ],
  // ── TRANSPORTE ──
  transporte: [
    { name: 'SUBE — Carga saldo',   code: 'SUBE', logo: '🚌', modes: ['Recarga'], inputLabel: 'N° de tarjeta SUBE (15 dígitos)', rechargeAmounts: [500, 1000, 2000, 3000, 5000] },
    { name: 'Peajes AUSOL',         code: 'AUS',  logo: '🛣️', modes: ['Factura'], inputLabel: 'N° de abono' },
    { name: 'Peajes GRUPO CONCESIONARIO', code: 'GPC', logo: '🛣️', modes: ['Factura'], inputLabel: 'N° de abono' },
    { name: 'Peajes COVISUR',       code: 'CVS',  logo: '🛣️', modes: ['Factura'], inputLabel: 'N° de abono' },
    { name: 'Peajes CAMINOS DEL RÍO', code: 'CRU', logo: '🛣️', modes: ['Factura'], inputLabel: 'N° de abono' },
    { name: 'Peajes AUTOPISTAS DEL SOL', code: 'ADS', logo: '🛣️', modes: ['Factura'], inputLabel: 'N° de abono' },
  ],
  // ── BILLETERAS VIRTUALES ──
  billetera: [
    { name: 'MercadoPago',          code: 'MPA',  logo: '💙', modes: ['Recarga'], inputLabel: 'CVU o alias de tu cuenta MP',   rechargeAmounts: [500, 1000, 2000, 5000, 10000] },
    { name: 'Ualá',                 code: 'UAL',  logo: '🟣', modes: ['Recarga'], inputLabel: 'CVU o email de tu cuenta Ualá', rechargeAmounts: [500, 1000, 2000, 5000, 10000] },
    { name: 'Brubank',              code: 'BRU',  logo: '🔵', modes: ['Recarga'], inputLabel: 'CVU o email de Brubank',         rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: 'Naranja X',            code: 'NXP',  logo: '🟠', modes: ['Recarga'], inputLabel: 'CVU o email de Naranja X',       rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: 'Prex',                 code: 'PRX',  logo: '🟢', modes: ['Recarga'], inputLabel: 'CVU o email de Prex',            rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: 'Cuenta DNI (Provincia)', code: 'CDN', logo: '🏦', modes: ['Recarga'], inputLabel: 'CVU o DNI',                    rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: 'MODO',                 code: 'MOD',  logo: '⚪', modes: ['Recarga'], inputLabel: 'CVU o email de MODO',            rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: 'Lemon Cash',           code: 'LEM',  logo: '🍋', modes: ['Recarga'], inputLabel: 'CVU o email de Lemon',           rechargeAmounts: [500, 1000, 2000] },
  ],
  // ── PREPAGAS MÉDICAS ──
  prepaga: [
    { name: 'OSDE',                 code: 'OSD',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de socio' },
    { name: 'Swiss Medical Group',  code: 'SWM',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'Medicus',              code: 'MED',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'Galeno',               code: 'GAL',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'Omint',                code: 'OMT',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'Sancor Salud',         code: 'SCS',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'ACCORD Healthcare',    code: 'ACC',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'Federada Salud',       code: 'FED',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'Sancor Mutuales',      code: 'SMT',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'OSPEDYC',              code: 'OSP',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'PAMI',                 code: 'PAM',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
    { name: 'IOSE',                 code: 'IOS',  logo: '🏥', modes: ['Factura'], inputLabel: 'Número de afiliado' },
  ],
  // ── EDUCACIÓN ──
  educacion: [
    { name: 'UBA (Universidad Bs As)', code: 'UBA',  logo: '🎓', modes: ['Factura'], inputLabel: 'N° de padrón / legajo' },
    { name: 'UTN',                  code: 'UTN',  logo: '🎓', modes: ['Factura'], inputLabel: 'N° de legajo' },
    { name: 'UNC (Córdoba)',         code: 'UNC',  logo: '🎓', modes: ['Factura'], inputLabel: 'N° de legajo' },
    { name: 'UADE',                 code: 'UADE', logo: '🎓', modes: ['Factura'], inputLabel: 'N° de legajo' },
    { name: 'Universidad Austral',  code: 'AUS',  logo: '🎓', modes: ['Factura'], inputLabel: 'N° de legajo' },
    { name: 'SIGLO XXI',            code: 'SXX',  logo: '🎓', modes: ['Factura'], inputLabel: 'N° de legajo' },
    { name: 'Instituto SEK',        code: 'SEK',  logo: '🏫', modes: ['Factura'], inputLabel: 'N° de alumno' },
    { name: 'Colegios ORT',         code: 'ORT',  logo: '🏫', modes: ['Factura'], inputLabel: 'N° de alumno' },
    { name: 'Colegio Northlands',   code: 'NTH',  logo: '🏫', modes: ['Factura'], inputLabel: 'N° de alumno' },
    { name: 'Jardín / Primaria pago cuota', code: 'EDU', logo: '🏫', modes: ['Factura'], inputLabel: 'N° de alumno / código de deuda' },
  ],
  // ── IMPUESTOS / AFIP / ABL ──
  municipal: [
    { name: 'ABL CABA',             code: 'ABL',  logo: '🏛️', modes: ['Factura', 'Partida'], inputLabel: 'Número de partida / cuenta' },
    { name: 'ARBA (Pcia Bs As)',    code: 'ARBA', logo: '🏛️', modes: ['Factura'],            inputLabel: 'CUIT / N° partida' },
    { name: 'Rentas Pcia Bs As',    code: 'REN',  logo: '🏛️', modes: ['Factura'],            inputLabel: 'Número de partida' },
    { name: 'AFIP — Autónomos',     code: 'AFP',  logo: '🏛️', modes: ['Factura'],            inputLabel: 'CUIT' },
    { name: 'AFIP — Empleados',     code: 'AFPE', logo: '🏛️', modes: ['Factura'],            inputLabel: 'CUIT' },
    { name: 'Rentas Córdoba',       code: 'RCB',  logo: '🏛️', modes: ['Factura'],            inputLabel: 'N° de expediente' },
    { name: 'Rentas Tucumán',       code: 'RTU',  logo: '🏛️', modes: ['Factura'],            inputLabel: 'N° de expediente' },
    { name: 'Rentas Mendoza',       code: 'RMZ',  logo: '🏛️', modes: ['Factura'],            inputLabel: 'N° de expediente' },
    { name: 'Municipio Mar del Plata', code: 'MDP', logo: '🏛️', modes: ['Factura'],          inputLabel: 'N° de cuenta / tasa' },
    { name: 'Municipio Rosario',    code: 'ROS',  logo: '🏛️', modes: ['Factura'],            inputLabel: 'N° de cuenta / tasa' },
    { name: 'AGIP (Ingresos Brutos)', code: 'AGIP', logo: '🏛️', modes: ['Factura'],          inputLabel: 'CUIT / N° expediente' },
    { name: 'VTV (Verificación Técnica)', code: 'VTV', logo: '🚗', modes: ['Factura'],        inputLabel: 'Dominio / patente' },
    { name: 'Multas de tránsito',   code: 'MUL',  logo: '🚦', modes: ['Factura'],            inputLabel: 'N° de acta / infracción' },
  ],
  // ── SEGUROS ──
  seguros: [
    { name: 'Sancor Seguros',       code: 'SCS',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'La Caja Seguros',      code: 'LCJ',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Zurich Argentina',     code: 'ZUR',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'San Cristóbal',        code: 'SNC',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Liberty Seguros',      code: 'LIB',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Federación Patronal',  code: 'FPT',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Allianz Argentina',    code: 'ALZ',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Mercantil Andina',     code: 'MCA',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Galeno Seguros',       code: 'GALS', logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
    { name: 'Triunfo Seguros',      code: 'TRI',  logo: '🛡️', modes: ['Factura'], inputLabel: 'N° de póliza' },
  ],
  // ── LOTERÍA / JUEGOS ──
  juegos: [
    { name: 'Lotería Nacional',     code: 'LOT',  logo: '🎰', modes: ['Recarga'], inputLabel: 'N° de cuenta / usuario', rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: 'Quiniela Online CABA', code: 'QNL',  logo: '🎲', modes: ['Recarga'], inputLabel: 'N° de cuenta / usuario', rechargeAmounts: [200, 500, 1000, 2000] },
    { name: 'PRODE',                code: 'PRD',  logo: '⚽', modes: ['Recarga'], inputLabel: 'N° de cuenta',           rechargeAmounts: [200, 500, 1000] },
    { name: 'Betsson Argentina',    code: 'BET',  logo: '🃏', modes: ['Recarga'], inputLabel: 'N° de cuenta / usuario', rechargeAmounts: [500, 1000, 2000, 5000] },
    { name: '888 Casino',           code: '888',  logo: '🎴', modes: ['Recarga'], inputLabel: 'N° de cuenta / usuario', rechargeAmounts: [500, 1000, 2000, 5000] },
  ],
};

const SERVICES = [
  { name: 'Edenor', icon: Zap, cat: 'Electricidad', color: '#F59E0B', bg: '#FEF3C7' },
  { name: 'Metrogas', icon: Flame, cat: 'Gas', color: '#EF4444', bg: '#FEE2E2' },
  { name: 'Aysa', icon: Droplets, cat: 'Agua', color: '#3B82F6', bg: '#DBEAFE' },
  { name: 'Fibertel', icon: Wifi, cat: 'Internet', color: '#8B5CF6', bg: '#EDE9FE' },
  { name: 'Personal', icon: Smartphone, cat: 'Celular', color: '#10B981', bg: '#D1FAE5' },
  { name: 'Claro', icon: Phone, cat: 'Celular', color: '#EF4444', bg: '#FEE2E2' },
  { name: 'DirecTV', icon: Tv, cat: 'TV', color: '#6B7280', bg: '#F3F4F6' },
];

function MiCuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout, updateUser } = useAuthStore();
  const { wallet, transactions, fetchWallet, fetchTransactions, deposit, withdraw, transfer } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null;
    if (tab && ['resumen','billetera','depositar','transferir','retirar','historial','qr','servicios','pedidos','perfil','favoritos','mensajes','seguridad','direcciones','configuracion','notificaciones'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [copiedCVU, setCopiedCVU] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  // Wallet form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('card');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCbu, setWithdrawCbu] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [serviceSelected, setServiceSelected] = useState('');
  const [serviceAccount, setServiceAccount] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');

  // Servicio de pagos — flujo multi-paso (espejo de Rapipago API)
  type SvcStep = 'categoria' | 'empresa' | 'datos' | 'factura' | 'confirmacion' | 'comprobante';
  interface SvcBill { amount: number; dueDate: string; period: string; invoiceId: string; status: 'pending' | 'overdue' }
  interface SvcVoucher { operationId: string; amount: number; company: string; companyLogo: string; category: string; account: string; date: string; authCode: string; invoiceId?: string; period?: string; type: string }
  const [svcStep, setSvcStep] = useState<SvcStep>('categoria');
  const [svcCat, setSvcCat] = useState('');
  const [svcSearch, setSvcSearch] = useState('');
  const [svcCompany, setSvcCompany] = useState<typeof SERVICES_BY_CAT['luz'][0] | null>(null);
  const [svcAccount, setSvcAccount] = useState('');
  const [svcBarcode, setSvcBarcode] = useState('');
  const [svcMode, setSvcMode] = useState<'account' | 'barcode' | 'camera'>('account');
  const [svcCameraActive, setSvcCameraActive] = useState(false);
  const [svcBill, setSvcBill] = useState<SvcBill | null>(null);
  const [svcCustomAmount, setSvcCustomAmount] = useState('');
  const [svcRechargeAmount, setSvcRechargeAmount] = useState('');
  const [svcLooking, setSvcLooking] = useState(false);
  const [svcPaying, setSvcPaying] = useState(false);
  const [svcVoucher, setSvcVoucher] = useState<SvcVoucher | null>(null);
  const [svcHistory, setSvcHistory] = useState<SvcVoucher[]>([]);

  // Simula el endpoint GET /bill/barcode/{barcode} o POST /bill/{companyCode}/payment-mode/{modeId}
  const lookupServiceBill = async () => {
    if (!svcAccount && !svcBarcode) { toast.error('Ingresá los datos'); return; }
    setSvcLooking(true);
    await new Promise(r => setTimeout(r, 1200)); // simula latencia de API
    const mockAmounts = [3420.50, 5876.00, 2100.75, 8943.20, 1560.00, 4230.90];
    const mockAmt = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];
    const now = new Date();
    const due = new Date(now.getTime() + (Math.random() > 0.3 ? 7 : -2) * 86400000);
    setSvcBill({
      amount: mockAmt,
      dueDate: due.toLocaleDateString('es-AR'),
      period: `${now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      invoiceId: `FAC-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      status: due < now ? 'overdue' : 'pending',
    });
    setSvcLooking(false);
    setSvcStep('factura');
  };

  // Simula el flujo: POST /payments/bills/prepare → POST /payments/{id}/confirm → POST /debit-vouchers/create
  const payService = async () => {
    const isRecarga = svcCompany?.modes[0] === 'Recarga';
    const finalAmount = isRecarga
      ? (parseFloat(svcRechargeAmount) || parseFloat(svcCustomAmount) || 0)
      : (parseFloat(svcCustomAmount) || svcBill?.amount || 0);
    if (finalAmount <= 0) { toast.error('Ingresá el monto a pagar'); return; }
    if (finalAmount > balance) { toast.error('Saldo insuficiente. Cargá saldo primero.'); return; }
    setSvcPaying(true);
    try {
      const catLabel = SERVICE_CATEGORIES.find(c => c.id === svcCat)?.label || svcCat;
      const ok = await deposit(finalAmount, `${isRecarga ? 'Recarga' : 'Pago'} ${svcCompany?.name} · ${svcAccount || svcBarcode}`, 'service_payment');
      if (ok) {
        const voucher: SvcVoucher = {
          operationId: `OP-${Date.now().toString(36).toUpperCase()}`,
          amount: finalAmount,
          company: svcCompany?.name || '',
          companyLogo: svcCompany?.logo || '🏢',
          category: catLabel,
          account: svcAccount || svcBarcode,
          date: new Date().toLocaleString('es-AR'),
          authCode: Math.random().toString(36).slice(2,10).toUpperCase(),
          invoiceId: svcBill?.invoiceId,
          period: svcBill?.period,
          type: isRecarga ? 'Recarga prepaga' : 'Pago de servicio',
        };
        setSvcVoucher(voucher);
        setSvcHistory(prev => [voucher, ...prev.slice(0, 9)]);
        fetchWallet();
        // Navegar a página de comprobante dedicada
        const params = encodeURIComponent(JSON.stringify(voucher));
        router.push(`/comprobante-servicio?data=${params}`);
      }
    } finally { setSvcPaying(false); }
  };

  // Procesar código de barras ingresado o escaneado
  const processBarcodeInput = (code: string) => {
    setSvcBarcode(code.replace(/\D/g, ''));
    if (code.length >= 20) { setSvcMode('barcode'); }
  };

  const resetSvcFlow = () => {
    setSvcStep('categoria'); setSvcCat(''); setSvcSearch(''); setSvcCompany(null);
    setSvcAccount(''); setSvcBarcode(''); setSvcBill(null); setSvcCustomAmount('');
    setSvcRechargeAmount(''); setSvcVoucher(null); setSvcCameraActive(false); setSvcMode('account');
  };

  // ── QR generator — tipos y estado ──
  type QRType = 'comercio' | 'caja' | 'sucursal' | 'producto' | 'precio_fijo' | 'precio_libre';
  interface QRItem {
    id: string; qrCode: string; qrImageBase64: string; amount: number | null;
    description: string; businessName: string; cuit: string; branchName: string; address: string;
    qrType: QRType; productName: string; isPermanent: boolean;
    expiresAt: string | null; payUrl: string; status: string;
    createdAt: string; scanCount: number; paymentCount: number; totalCollected: number;
  }
  const QR_TYPE_CONFIG: Record<QRType, { label: string; icon: any; color: string; bg: string; desc: string; permanent: boolean }> = {
    comercio:      { label: 'QR Comercio',      icon: Store,       color: '#3B82F6', bg: '#EFF6FF', desc: 'QR permanente del negocio — acepta cualquier monto', permanent: true },
    caja:          { label: 'QR Caja',           icon: CreditCard,  color: '#8B5CF6', bg: '#F5F3FF', desc: 'QR permanente para una caja específica', permanent: true },
    sucursal:      { label: 'QR Sucursal',       icon: Building2,   color: '#0891B2', bg: '#ECFEFF', desc: 'QR permanente identificado por sucursal', permanent: true },
    producto:      { label: 'QR Producto',       icon: Package,     color: '#10B981', bg: '#ECFDF5', desc: 'Vinculado a producto específico con precio', permanent: false },
    precio_fijo:   { label: 'QR Monto fijo',     icon: Zap,         color: '#F59E0B', bg: '#FFFBEB', desc: 'Monto fijo, un solo uso, expira en 30 min', permanent: false },
    precio_libre:  { label: 'QR Monto libre',    icon: DollarSign,  color: '#EC4899', bg: '#FDF2F8', desc: 'El cliente ingresa el monto, expira en 30 min', permanent: false },
  };
  const [qrType, setQrType] = useState<QRType>('comercio');
  const [qrSaved, setQrSaved] = useState<QRItem[]>([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrCopied, setQrCopied] = useState('');
  const [qrDeleteConfirm, setQrDeleteConfirm] = useState('');
  const [qrForm, setQrForm] = useState({
    businessName: '', cuit: '', branchName: '', address: '',
    description: '', productName: '', amount: '',
  });
  const [qrPreview, setQrPreview] = useState<QRItem | null>(null);

  const fetchMyQRs = async () => {
    setQrLoading(true);
    try {
      const { data } = await api.get('/pago-simple/qr/my');
      setQrSaved(data.qrs || []);
    } catch { /* ignore */ }
    finally { setQrLoading(false); }
  };

  const handleGenerateQR = async () => {
    const cfg = QR_TYPE_CONFIG[qrType];
    if (!cfg.permanent && qrType === 'precio_fijo' && !qrForm.amount) {
      toast.error('Ingresá el monto para el QR de precio fijo'); return;
    }
    if (qrType === 'producto' && !qrForm.productName) {
      toast.error('Ingresá el nombre del producto'); return;
    }
    setQrGenerating(true);
    try {
      const payload: any = {
        qrType,
        businessName: qrForm.businessName || user?.name || 'Mi Comercio',
        cuit: qrForm.cuit,
        branchName: qrForm.branchName,
        address: qrForm.address,
        description: qrForm.description || qrForm.productName || `Pago Simple · ${cfg.label}`,
        productName: qrForm.productName,
        amount: qrForm.amount ? parseFloat(qrForm.amount) : undefined,
      };
      const { data } = await api.post('/pago-simple/qr/generate', payload);
      const newQR: QRItem = {
        id: data.id, qrCode: data.qrCode, qrImageBase64: data.qrImageBase64,
        amount: data.amount, description: data.description,
        businessName: data.businessName || payload.businessName,
        cuit: data.cuit || payload.cuit, branchName: data.branchName || payload.branchName,
        address: data.address || payload.address, qrType, productName: data.productName || '',
        isPermanent: data.isPermanent, expiresAt: data.expiresAt, payUrl: data.payUrl,
        status: 'active', createdAt: new Date().toISOString(),
        scanCount: 0, paymentCount: 0, totalCollected: 0,
      };
      setQrSaved(prev => [newQR, ...prev]);
      setQrPreview(newQR);
      setQrForm({ businessName: '', cuit: '', branchName: '', address: '', description: '', productName: '', amount: '' });
      toast.success('QR creado y guardado');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error al generar QR'); }
    finally { setQrGenerating(false); }
  };

  const handleDeleteQR = async (qrId: string) => {
    try {
      await api.delete(`/pago-simple/qr/${qrId}`);
      setQrSaved(prev => prev.filter(q => q.id !== qrId));
      if (qrPreview?.id === qrId) setQrPreview(null);
      setQrDeleteConfirm('');
      toast.success('QR eliminado');
    } catch (err: any) { toast.error('No se pudo eliminar el QR'); }
  };

  const downloadQR = (qr: QRItem, asPrint = false) => {
    if (asPrint) {
      // Open printable HTML version
      const html = buildPrintableQR(qr);
      const w = window.open('', '_blank');
      if (w) { w.document.write(html); w.document.close(); w.print(); }
      return;
    }
    const a = document.createElement('a'); a.href = qr.qrImageBase64;
    a.download = `pago-simple-qr-${qr.branchName || qr.businessName || qr.qrCode}.png`;
    a.click(); toast.success('QR descargado');
  };

  const buildPrintableQR = (qr: QRItem): string => `
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>QR Pago Simple — ${qr.businessName || 'Comercio'}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Arial', sans-serif; background:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }
      .card { width:340px; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.15); border:2px solid #E2E8F0; }
      .header { background:linear-gradient(135deg,#1D4ED8,#3B82F6); color:#fff; padding:20px; text-align:center; }
      .logo-row { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px; }
      .logo-text { font-size:11px; font-weight:900; letter-spacing:2px; text-transform:uppercase; }
      .logo-badge { font-size:9px; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:20px; border:1px solid rgba(255,255,255,0.3); }
      .business-name { font-size:20px; font-weight:900; margin-bottom:4px; }
      .branch-name { font-size:12px; opacity:0.8; }
      .qr-area { background:#fff; padding:24px; text-align:center; }
      .qr-img { width:200px; height:200px; border-radius:12px; border:2px solid #E2E8F0; }
      .scan-text { font-size:13px; font-weight:700; color:#1D4ED8; margin-top:12px; text-transform:uppercase; letter-spacing:1px; }
      .info-area { padding:16px; background:#F8FAFC; border-top:1px solid #E2E8F0; }
      .info-row { display:flex; justify-content:space-between; font-size:11px; color:#64748B; margin-bottom:6px; }
      .info-val { font-weight:700; color:#1E293B; font-family:monospace; }
      .amount-row { display:flex; justify-content:space-between; font-size:14px; font-weight:900; padding-top:8px; border-top:1px solid #E2E8F0; margin-top:8px; color:#1E293B; }
      .amount-val { color:#1D4ED8; }
      .footer { background:#1E293B; color:#94A3B8; text-align:center; padding:10px; font-size:9px; }
      @media print { body{margin:0;} }
    </style></head><body>
    <div class="card">
      <div class="header">
        <div class="logo-row"><span class="logo-text">⚡ PAGO SIMPLE</span><span class="logo-badge">Pago seguro</span></div>
        <div class="business-name">${qr.businessName || 'Mi Comercio'}</div>
        ${qr.branchName ? `<div class="branch-name">${qr.branchName}</div>` : ''}
      </div>
      <div class="qr-area">
        <img class="qr-img" src="${qr.qrImageBase64}" alt="QR Pago Simple" />
        <div class="scan-text">Escaneá para pagar</div>
      </div>
      <div class="info-area">
        ${qr.cuit ? `<div class="info-row"><span>CUIT</span><span class="info-val">${qr.cuit}</span></div>` : ''}
        ${qr.address ? `<div class="info-row"><span>Dirección</span><span class="info-val">${qr.address}</span></div>` : ''}
        <div class="info-row"><span>Código</span><span class="info-val">${qr.qrCode}</span></div>
        <div class="info-row"><span>Tipo</span><span class="info-val">${QR_TYPE_CONFIG[qr.qrType]?.label || qr.qrType}</span></div>
        ${qr.amount ? `<div class="amount-row"><span>Monto</span><span class="amount-val">$${Number(qr.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>` : '<div class="amount-row"><span>Monto</span><span class="amount-val">Libre</span></div>'}
      </div>
      <div class="footer">Mercado Simple S.R.L. · CUIT 30-00000000-0 · Documento generado el ${new Date().toLocaleDateString('es-AR')}</div>
    </div></body></html>`;

  const copyQRLink = async (qr: QRItem) => {
    await navigator.clipboard.writeText(`${window.location.origin}${qr.payUrl}`);
    setQrCopied(qr.qrCode); setTimeout(() => setQrCopied(''), 2000); toast.success('Link copiado');
  };

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', city: '', province: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login?returnUrl=' + encodeURIComponent('/mi-cuenta')); return; }
    fetchWallet();
    fetchTransactions();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', city: user.city || '', province: user.province || '' });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'pedidos' && orders.length === 0) fetchOrders();
    if (activeTab === 'qr') fetchMyQRs();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try { const { data } = await api.get('/orders'); setOrders(data.orders || []); }
    catch { toast.error('Error al cargar pedidos'); }
    finally { setOrdersLoading(false); }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 100) { toast.error('Monto mínimo $100'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/wallet/deposit', {
        amount,
        description: 'Solicitud de carga de saldo',
        paymentMethod: depositMethod,
      });
      toast.success(data.message || 'Solicitud enviada. El administrador la aprobará en breve.');
      setDepositAmount('');
      setActiveTab('historial');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al enviar solicitud');
    }
    setIsLoading(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) { toast.error('Monto mínimo $100'); return; }
    setIsLoading(true);
    const ok = await withdraw(amount, withdrawCbu, 'Retiro bancario');
    if (ok) { setWithdrawAmount(''); setWithdrawCbu(''); setActiveTab('billetera'); }
    setIsLoading(false);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount < 10) { toast.error('Monto mínimo $10'); return; }
    if (!lookupResult && !transferEmail) { toast.error('Buscá y confirmá el destinatario primero'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/wallet/transfer', {
        recipientQuery: lookupQuery || transferEmail,
        recipientEmail: transferEmail,
        amount,
        description: transferDesc,
      });
      toast.success(data.message);
      setLastReceipt({ id: data.receiptId, number: data.receiptNumber, recipient: data.recipient, amount: data.amount });
      setTransferEmail(''); setTransferAmount(''); setTransferDesc('');
      setLookupQuery(''); setLookupResult(null);
      fetchWallet(); fetchTransactions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al transferir');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const { data } = await api.get(`/wallet/lookup?q=${encodeURIComponent(lookupQuery)}`);
      setLookupResult(data.recipient);
    } catch (err: any) {
      setLookupError(err?.response?.data?.message || 'No encontrado');
    } finally {
      setLookupLoading(false);
    }
  };

  const fetchReceipts = async () => {
    setReceiptsLoading(true);
    try {
      const { data } = await api.get('/wallet/receipts?limit=20');
      setReceipts(data.receipts || []);
    } catch { /* silent */ } finally {
      setReceiptsLoading(false);
    }
  };

  const handleServicePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(serviceAmount);
    if (!serviceSelected || !serviceAccount || isNaN(amount) || amount < 1) { toast.error('Completá todos los campos'); return; }
    setIsLoading(true);
    const ok = await deposit(amount, `Pago ${serviceSelected}`, 'service_payment');
    if (ok) { setServiceSelected(''); setServiceAccount(''); setServiceAmount(''); setActiveTab('billetera'); }
    setIsLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/users/me', profileForm);
      updateUser(data);
      toast.success('Perfil actualizado');
    } catch { toast.error('Error al guardar'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    if (pwForm.new.length < 8) { toast.error('Mínimo 8 caracteres'); return; }
    try {
      await api.put('/users/me', { password: pwForm.new, currentPassword: pwForm.current });
      toast.success('Contraseña actualizada');
      setPwForm({ current: '', new: '', confirm: '' });
    } catch { toast.error('Error al cambiar contraseña'); }
  };

  const balance = Number(wallet?.balance || 0);
  const cvu = (wallet as any)?.cvu || '—';
  const alias = (wallet as any)?.alias || '—';

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'transfer_out': return <Send className="w-4 h-4 text-orange-500" />;
      case 'transfer_in': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      default: return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const txColor = (type: string) => ['deposit', 'transfer_in', 'refund', 'cashback'].includes(type) ? '#059669' : '#DC2626';
  const txSign = (type: string) => ['deposit', 'transfer_in', 'refund', 'cashback'].includes(type) ? '+' : '-';

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return null;

  const NAV_GROUPS = [
    {
      label: 'Mi cuenta',
      items: [
        { id: 'resumen' as Tab, icon: User, label: 'Resumen' },
        { id: 'pedidos' as Tab, icon: Package, label: 'Mis pedidos' },
        { id: 'favoritos' as Tab, icon: Heart, label: 'Favoritos' },
        { id: 'mensajes' as Tab, icon: MessageCircle, label: 'Mensajes' },
        { id: 'notificaciones' as Tab, icon: Bell, label: 'Notificaciones' },
      ],
    },
    {
      label: '⚡ Pago Simple',
      items: [
        { id: 'billetera' as Tab, icon: Wallet, label: 'Mi cuenta Pago Simple' },
        { id: 'depositar' as Tab, icon: Plus, label: 'Cargar saldo' },
        { id: 'transferir' as Tab, icon: Send, label: 'Transferir dinero' },
        { id: 'retirar' as Tab, icon: ArrowUp, label: 'Retirar fondos' },
        { id: 'historial' as Tab, icon: History, label: 'Historial de movimientos' },
        { id: 'servicios' as Tab, icon: Building2, label: 'Pagar servicios' },
        { id: 'qr' as Tab, icon: QrCode, label: 'Cobrar con QR' },
      ],
    },
    {
      label: 'Configuración',
      items: [
        { id: 'perfil' as Tab, icon: User, label: 'Mi perfil' },
        { id: 'seguridad' as Tab, icon: Shield, label: 'Seguridad' },
        { id: 'direcciones' as Tab, icon: MapPin, label: 'Direcciones' },
        { id: 'configuracion' as Tab, icon: Settings, label: 'Configuración' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ========== SIDEBAR ========== */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <SolMayo size={28} />
          <div>
            <div className="font-black text-white text-base leading-none tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              MERCADO <span style={{ color: '#F6B40E' }}>SIMPLE</span>
            </div>
            <div className="text-white/30 text-[9px] tracking-widest mt-0.5">MI CUENTA</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 rounded-lg text-white/40"><X className="w-4 h-4" /></button>
        </div>

        {/* User info */}
        <div className="mx-3 mb-4 rounded-2xl p-3.5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>{user?.name}</p>
              <p className="text-white/40 text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">⚡ Pago Simple · Saldo</p>
            <p className="font-black text-white text-xl leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>{formatPrice(balance)}</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-medium`}
                    style={{
                      background: activeTab === id ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: activeTab === id ? '#93C5FD' : 'rgba(255,255,255,0.4)',
                      borderLeft: activeTab === id ? '2px solid #3B82F6' : '2px solid transparent',
                    }}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {user?.role === 'seller' || user?.role === 'admin' ? (
            <Link href="/vendedor/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
              style={{ color: 'rgba(246,180,14,0.7)' }}>
              <TrendingUp className="w-4 h-4" /> Panel vendedor
            </Link>
          ) : null}
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <ArrowDownLeft className="w-4 h-4" /> Ir al inicio
          </Link>
          <button onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="bg-white px-4 lg:px-6 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-black text-gray-900 text-lg leading-none capitalize" style={{ fontFamily: 'Raleway, sans-serif' }}>
                {activeTab === 'resumen' ? 'Mi cuenta — Mercado Simple' :
                 activeTab === 'billetera' ? '⚡ Pago Simple' :
                 activeTab === 'depositar' ? '⚡ Pago Simple · Cargar saldo' :
                 activeTab === 'transferir' ? '⚡ Pago Simple · Transferir' :
                 activeTab === 'retirar' ? '⚡ Pago Simple · Retirar fondos' :
                 activeTab === 'historial' ? '⚡ Pago Simple · Historial' :
                 activeTab === 'servicios' ? '⚡ Pago Simple · Servicios' :
                 activeTab === 'qr' ? '⚡ Pago Simple · QR de cobro' :
                 activeTab === 'pedidos' ? 'Mercado Simple · Mis pedidos' :
                 activeTab === 'perfil' ? 'Mi perfil' :
                 activeTab === 'seguridad' ? 'Seguridad' :
                 activeTab === 'direcciones' ? 'Direcciones guardadas' :
                 activeTab === 'configuracion' ? 'Configuración' :
                 activeTab === 'notificaciones' ? 'Notificaciones' :
                 activeTab === 'favoritos' ? 'Mis favoritos' : 'Mensajes'}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Hola, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('notificaciones')} className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <button onClick={() => { setActiveTab('depositar'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hidden sm:flex"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
              <Plus className="w-4 h-4" /> Cargar saldo
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">

          {/* ====== RESUMEN ====== */}
          {activeTab === 'resumen' && (
            <div className="space-y-4">

              {/* ── Hero: balance + acciones principales ── */}
              <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #1D4ED8 100%)', minHeight: 160 }}>
                <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 85% 30%, #F6B40E 0%, transparent 55%)' }} />
                <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Bienvenido a <span className="font-bold text-white">Mercado Simple</span>, {user?.name?.split(' ')[0]}</p>
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-2">⚡ Pago Simple · Saldo disponible</p>
                    <p className="font-black text-white leading-none" style={{ fontSize: 40, fontFamily: 'Raleway, sans-serif' }}>
                      {formatPrice(balance)}
                    </p>
                    <p className="text-white/30 text-xs mt-1">ARS · Pesos argentinos</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveTab('depositar')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                      style={{ background: '#3B82F6', color: '#fff' }}>
                      <Plus className="w-4 h-4" /> Ingresar
                    </button>
                    <button onClick={() => setActiveTab('transferir')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Send className="w-4 h-4" /> Transferir
                    </button>
                  </div>
                </div>
              </div>

              {/* ── KPI cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Pedidos realizados', value: orders.length > 0 ? orders.length : '—', sub: 'Total histórico', icon: Package, color: '#10B981', bg: '#ECFDF5' },
                  { label: 'Reputación', value: `${user?.reputation ? Number(user.reputation).toFixed(1) : '5.0'}★`, sub: 'Calificación promedio', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
                  { label: 'Favoritos', value: '—', sub: 'Productos guardados', icon: Heart, color: '#EC4899', bg: '#FDF2F8' },
                  { label: 'Miembro desde', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '—', sub: String(user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR', { month: 'long' }) : ''), icon: CheckCircle, color: '#8B5CF6', bg: '#F5F3FF' },
                ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                    </div>
                    <p className="font-black text-gray-900 text-2xl leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>{value}</p>
                    <p className="text-gray-500 text-xs mt-1 font-medium">{label}</p>
                    <p className="text-gray-400 text-[11px]">{sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Dos columnas: actividad + pedidos ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Últimos movimientos */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Tu actividad</h3>
                    <button onClick={() => setActiveTab('historial')} className="text-xs font-semibold text-blue-600 hover:underline">Ver todos →</button>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Sin movimientos aún</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setActiveTab('historial')}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F8FAFC' }}>
                            {getTxIcon(tx.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{tx.description || tx.type}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <p className="text-sm font-bold flex-shrink-0" style={{ color: txColor(tx.type) }}>
                            {txSign(tx.type)}{formatPrice(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Últimos pedidos */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Mis pedidos</h3>
                    <button onClick={() => setActiveTab('pedidos')} className="text-xs font-semibold text-blue-600 hover:underline">Ver todos →</button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Sin pedidos aún</p>
                      <Link href="/productos" className="text-xs text-blue-600 font-medium mt-1 inline-block hover:underline">Explorar productos →</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 4).map((order) => (
                        <div key={order.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setActiveTab('pedidos')}>
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">Orden #{order.id?.slice(0,8).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(Number(order.total))}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
                              {order.status || 'procesando'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Acceso rápido dividido por marca ── */}
              <div className="space-y-3">
                {/* Mercado Simple */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">🛒 Mercado Simple</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'pedidos' as Tab, icon: Package, label: 'Mis pedidos', color: '#3B82F6', bg: '#EFF6FF' },
                      { id: 'favoritos' as Tab, icon: Heart, label: 'Favoritos', color: '#EC4899', bg: '#FDF2F8' },
                      { id: 'mensajes' as Tab, icon: MessageCircle, label: 'Mensajes', color: '#6B7280', bg: '#F9FAFB' },
                      { id: 'notificaciones' as Tab, icon: Bell, label: 'Alertas', color: '#F59E0B', bg: '#FEF3C7' },
                    ].map(({ id, icon: Icon, label, color, bg }) => (
                      <button key={id} onClick={() => setActiveTab(id)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 text-center leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Pago Simple */}
                <div className="rounded-2xl p-5" style={{ border: '1px solid #BFDBFE', background: '#EFF6FF' }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">⚡ Pago Simple</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'billetera' as Tab, icon: Wallet, label: 'Mi cuenta', color: '#1D4ED8', bg: '#DBEAFE' },
                      { id: 'depositar' as Tab, icon: Plus, label: 'Cargar', color: '#059669', bg: '#D1FAE5' },
                      { id: 'transferir' as Tab, icon: Send, label: 'Transferir', color: '#6366F1', bg: '#EEF2FF' },
                      { id: 'servicios' as Tab, icon: Building2, label: 'Servicios', color: '#0891B2', bg: '#ECFEFF' },
                      { id: 'qr' as Tab, icon: QrCode, label: 'QR', color: '#7C3AED', bg: '#EDE9FE' },
                      { id: 'historial' as Tab, icon: History, label: 'Historial', color: '#0F766E', bg: '#CCFBF1' },
                      { id: 'retirar' as Tab, icon: ArrowUp, label: 'Retirar', color: '#DC2626', bg: '#FEE2E2' },
                    ].map(({ id, icon: Icon, label, color, bg }) => (
                      <button key={id} onClick={() => setActiveTab(id)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5 bg-white">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ====== BILLETERA ====== */}
          {activeTab === 'billetera' && (
            <div className="space-y-5">
              {/* Balance card */}
              <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F4C2A 100%)' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm font-medium">Pago Simple · Billetera</span>
                    </div>
                    <button onClick={() => { fetchWallet(); fetchTransactions(); }} className="p-1.5 rounded-lg hover:bg-white/10 transition text-gray-400">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Saldo disponible</p>
                  <p className="font-black text-5xl text-white mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>${Number(balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-gray-500 text-sm mb-6">ARS · Pesos argentinos</p>

                  {/* CVU, Alias, Cuenta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'CVU', value: cvu, mono: true, canCopy: true, id: 'cvu' },
                      { label: 'Alias', value: alias, mono: false, canCopy: true, id: 'alias' },
                      { label: 'N° Cuenta', value: wallet?.accountNumber || '—', mono: true, canCopy: false, id: 'acct' },
                    ].map(item => (
                      <div key={item.id} className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                        <div className={`text-white text-sm ${item.mono ? 'font-mono' : 'font-semibold'} break-all leading-tight`}>{item.value || '—'}</div>
                        {item.canCopy && item.value && (
                          <button onClick={() => {
                            navigator.clipboard.writeText(item.value);
                            if (item.id === 'cvu') { setCopiedCVU(true); setTimeout(() => setCopiedCVU(false), 2000); }
                            else { setCopiedAlias(true); setTimeout(() => setCopiedAlias(false), 2000); }
                            toast.success(`${item.label} copiado`);
                          }} className="mt-1.5 flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                            {(item.id === 'cvu' && copiedCVU) || (item.id === 'alias' && copiedAlias) ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copiar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions bar */}
                <div className="grid grid-cols-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {[
                    { id: 'depositar' as Tab, icon: Plus, label: 'Cargar' },
                    { id: 'transferir' as Tab, icon: Send, label: 'Enviar' },
                    { id: 'historial' as Tab, icon: History, label: 'Historial' },
                    { id: 'servicios' as Tab, icon: Building2, label: 'Servicios' },
                  ].map(({ id, icon: Icon, label }) => (
                    <button key={id} onClick={() => setActiveTab(id)} className="flex flex-col items-center gap-1 py-4 hover:bg-white/5 transition-colors">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500">{label}</span>
                    </button>
                  ))}
                  <Link href="/billetera/qr" className="flex flex-col items-center gap-1 py-4 hover:bg-white/5 transition-colors">
                    <QrCode className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-gray-500">QR</span>
                  </Link>
                </div>
              </div>

              {/* Links rápidos */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/billetera/extracto" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
                  <div><div className="font-semibold text-gray-900 text-sm">Extracto bancario</div><div className="text-xs text-gray-400">Resumen de cuenta</div></div>
                </Link>
                <button onClick={() => { setActiveTab('historial'); fetchReceipts(); }} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow text-left">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                  <div><div className="font-semibold text-gray-900 text-sm">Comprobantes</div><div className="text-xs text-gray-400">Historial de operaciones</div></div>
                </button>
              </div>

              {/* Recent transactions */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                <div className="flex items-center justify-between p-5 border-b border-gray-50">
                  <h3 className="font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Últimos movimientos</h3>
                  <button onClick={() => setActiveTab('historial')} className="text-xs font-semibold text-blue-500 hover:underline">Ver todos →</button>
                </div>
                {transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      {getTxIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: txColor(tx.type) }}>
                        {txSign(tx.type)}${Number(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400">Saldo: ${Number(tx.balanceAfter).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Sin movimientos</p>}
              </div>
            </div>
          )}

          {/* ====== DEPOSITAR ====== */}
          {activeTab === 'depositar' && (
            <div className="grid lg:grid-cols-5 gap-5">
              {/* Formulario */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
                  <h3 className="font-black text-gray-900 text-xl mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Solicitar carga de saldo</h3>
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-xs">La solicitud será revisada y aprobada por el administrador. El saldo se acreditará una vez aprobada, generalmente en menos de 24 hs.</p>
                  </div>
                  <form onSubmit={handleDeposit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Monto a cargar (ARS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl pointer-events-none">$</span>
                        <input type="number" min="100" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 text-gray-900 bg-white text-2xl font-black outline-none transition-colors"
                          style={{ borderColor: depositAmount ? '#3B82F6' : '#E2E8F0' }}
                          placeholder="0" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {[500, 1000, 2000, 5000].map(v => (
                          <button key={v} type="button" onClick={() => setDepositAmount(String(v))}
                            className="py-2 rounded-xl text-sm font-bold transition-all"
                            style={{ background: depositAmount === String(v) ? '#3B82F6' : '#F1F5F9', color: depositAmount === String(v) ? '#fff' : '#64748B' }}>
                            ${v.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Método de pago</label>
                      <div className="space-y-2">
                        {[
                          { id: 'card', label: 'Tarjeta de crédito/débito', sub: 'Visa, Mastercard, American Express', icon: CreditCard },
                          { id: 'transfer', label: 'Transferencia bancaria', sub: 'CBU/CVU desde tu banco', icon: Building2 },
                        ].map(({ id, label, sub, icon: Icon }) => (
                          <button key={id} type="button" onClick={() => setDepositMethod(id)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                            style={{ border: `2px solid ${depositMethod === id ? '#3B82F6' : '#E2E8F0'}`, background: depositMethod === id ? '#EFF6FF' : '#FAFAFA' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: depositMethod === id ? '#DBEAFE' : '#F1F5F9' }}>
                              <Icon className="w-5 h-5" style={{ color: depositMethod === id ? '#3B82F6' : '#9CA3AF' }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold" style={{ color: depositMethod === id ? '#1D4ED8' : '#374151' }}>{label}</p>
                              <p className="text-xs text-gray-400">{sub}</p>
                            </div>
                            {depositMethod === id && <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading || !depositAmount}
                      className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                      {isLoading ? 'Procesando...' : `Cargar ${depositAmount ? '$' + Number(depositAmount).toLocaleString('es-AR') : 'saldo'}`}
                    </button>
                  </form>
                </div>
              </div>
              {/* Sidebar info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Tu saldo actual</p>
                  <p className="font-black text-3xl text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>{formatPrice(balance)}</p>
                  <p className="text-gray-400 text-xs mt-1">ARS · Pesos argentinos</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">CVU</span><span className="font-mono text-xs text-gray-700">{cvu?.slice(0, 10)}...</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Alias</span><span className="font-semibold text-blue-600 text-xs">{alias}</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4" style={{ border: '1px solid #DBEAFE' }}>
                  <p className="text-xs font-bold text-blue-700 mb-2">💡 Acreditación instantánea</p>
                  <p className="text-xs text-blue-600">El saldo se acredita de forma inmediata. Podés usar los fondos al instante para transferir, pagar o comprar.</p>
                </div>
              </div>
            </div>
          )}

          {/* ====== TRANSFERIR ====== */}
          {activeTab === 'transferir' && (
            <div className="grid lg:grid-cols-5 gap-5">
              {/* ── Columna principal ── */}
              <div className="lg:col-span-3 space-y-4">
              {/* Último comprobante generado */}
              {lastReceipt && (
                <div className="p-4 rounded-2xl border-2 border-green-400 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                      <CheckCircle className="w-4 h-4" /> ¡Transferencia exitosa!
                    </div>
                    <button onClick={() => setLastReceipt(null)} className="text-green-500 hover:text-green-700"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-green-800">Para: <strong>{lastReceipt.recipient?.name}</strong> · ${Number(lastReceipt.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS</p>
                  <p className="text-xs text-green-600 mt-1 font-mono">N° {lastReceipt.number}</p>
                  <Link href={`/billetera/comprobante/${lastReceipt.id}`} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                    <FileText className="w-3 h-3" /> Ver comprobante
                  </Link>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
                <h3 className="font-black text-gray-900 text-xl mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Transferir dinero</h3>
                <p className="text-gray-400 text-sm mb-5">Saldo disponible: <strong className="text-green-600">${Number(balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS</strong></p>

                <form onSubmit={handleTransfer} className="space-y-4">
                  {/* LOOKUP DESTINATARIO */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Buscar destinatario
                      <span className="text-gray-400 font-normal ml-1">(CVU, alias o email)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={lookupQuery}
                        onChange={e => { setLookupQuery(e.target.value); setLookupResult(null); setLookupError(''); }}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
                        className="input-wallet flex-1"
                        placeholder="Ej: CAMPO.SOL.LIBRE o CVU 0000099..."
                      />
                      <button type="button" onClick={handleLookup} disabled={lookupLoading || !lookupQuery.trim()}
                        className="px-4 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                        {lookupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Buscar'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">También podés ingresar email o número MS-XXXXXXX</p>

                    {/* Resultado del lookup */}
                    {lookupError && (
                      <div className="mt-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {lookupError}
                      </div>
                    )}
                    {lookupResult && (
                      <div className="mt-2 p-4 rounded-2xl border-2 border-blue-400 bg-blue-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                            {lookupResult.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900">{lookupResult.name}</div>
                            <div className="text-xs text-gray-500">{lookupResult.email}</div>
                            <div className="text-xs text-blue-600 font-mono mt-0.5">{lookupResult.cvu}</div>
                            <div className="text-xs text-gray-500">Alias: <span className="font-semibold">{lookupResult.alias}</span></div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MONTO */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monto (ARS)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg pointer-events-none z-10">$</span>
                      <input type="number" min="10" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}
                        className="input-amount w-full pl-9 pr-4 py-3"
                        placeholder="500" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[500, 1000, 2000, 5000].map(v => (
                        <button key={v} type="button" onClick={() => setTransferAmount(String(v))}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: transferAmount === String(v) ? '#3B82F6' : '#F1F5F9', color: transferAmount === String(v) ? '#fff' : '#64748B' }}>
                          ${v.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DESCRIPCION */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Concepto (opcional)</label>
                    <input type="text" value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)}
                      className="input-wallet w-full"
                      placeholder="Ej: Pago de alquiler, cuota, etc." />
                  </div>

                  {/* CONFIRMAR */}
                  {lookupResult && transferAmount && (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Resumen de la transferencia</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Para</span><span className="font-bold">{lookupResult.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">CVU destino</span><span className="font-mono text-xs">{lookupResult.cvu}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Monto</span><span className="font-bold text-blue-600">${Number(transferAmount).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS</span></div>
                        {transferDesc && <div className="flex justify-between"><span className="text-gray-500">Concepto</span><span className="font-medium">{transferDesc}</span></div>}
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading || (!lookupResult && !lookupQuery) || !transferAmount}
                    className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                    {isLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Enviando...</> : <><Send className="w-5 h-5" /> Confirmar transferencia</>}
                  </button>
                </form>
              </div>
              </div>{/* ─ fin col-span-3 ─ */}

              {/* ── Columna lateral ── */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Tu saldo disponible</p>
                  <p className="font-black text-3xl text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>{formatPrice(balance)}</p>
                  <p className="text-gray-400 text-xs mt-1">ARS · Pesos argentinos</p>
                  {cvu && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">CVU</span><span className="font-mono text-xs text-gray-700 truncate max-w-[120px]">{cvu?.slice(0,10)}...</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Alias</span><span className="font-semibold text-blue-600 text-xs">{alias}</span></div>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 rounded-2xl p-4" style={{ border: '1px solid #DBEAFE' }}>
                  <p className="text-xs font-bold text-blue-700 mb-2">🔒 Transferencia segura</p>
                  <p className="text-xs text-blue-600">Verificamos el destinatario por CVU, alias o email antes de enviar. Las transferencias son instantáneas e irreversibles.</p>
                </div>
                <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Últimas transferencias</p>
                  {transactions.filter(t => t.type === 'transfer_out').slice(0, 3).length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-3">Sin transferencias previas</p>
                  ) : transactions.filter(t => t.type === 'transfer_out').slice(0, 3).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{tx.description || 'Transferencia'}</p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString('es-AR')}</p>
                      </div>
                      <p className="text-xs font-bold text-red-500">-{formatPrice(tx.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== HISTORIAL ====== */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-xl" style={{ fontFamily: 'Raleway, sans-serif' }}>Movimientos</h3>
                  <p className="text-gray-400 text-sm">{transactions.length} transacciones</p>
                </div>
                <div className="flex gap-2">
                  <Link href="/billetera/extracto" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                    <FileText className="w-4 h-4" /> Extracto completo
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <History className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Sin movimientos registrados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          {getTxIcon(tx.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{tx.description || tx.type}</p>
                          <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                        <div className="text-right flex-shrink-0 mr-3">
                          <p className="font-bold text-sm" style={{ color: txColor(tx.type) }}>
                            {txSign(tx.type)}${Number(tx.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                          {tx.status === 'pending' ? (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⏳ Pendiente aprobación</span>
                          ) : tx.status === 'failed' ? (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">✗ Rechazado</span>
                          ) : (
                            <p className="text-xs text-gray-400">Saldo: ${Number(tx.balanceAfter).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                          )}
                        </div>
                        <Link href={`/billetera/comprobante/${tx.id}`} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Ver comprobante">
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ====== QR ====== */}
          {activeTab === 'qr' && (
            <div className="grid lg:grid-cols-5 gap-5">

              {/* ── LEFT: Formulario ── */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <h3 className="font-black text-gray-900 text-base mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Crear nuevo QR</h3>
                  <p className="text-xs text-gray-400 mb-4">Datos del comercio + tipo de cobro</p>

                  {/* Tipo de QR */}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tipo de punto de venta</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(Object.entries(QR_TYPE_CONFIG) as [QRType, typeof QR_TYPE_CONFIG[QRType]][]).map(([t, cfg]) => (
                      <button key={t} onClick={() => { setQrType(t); setQrForm(p => ({ ...p, amount: '' })); }}
                        className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center"
                        style={{ borderColor: qrType === t ? cfg.color : '#E2E8F0', background: qrType === t ? cfg.bg : '#F8FAFC' }}>
                        <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                        <span className="text-[10px] font-bold text-gray-800 leading-tight">{cfg.label}</span>
                        {cfg.permanent && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Permanente</span>}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {/* Datos del comercio */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre del comercio / razón social *</label>
                      <input value={qrForm.businessName} onChange={e => setQrForm(p => ({ ...p, businessName: e.target.value }))}
                        placeholder={user?.name || 'Ej: Librería El Saber'}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-sm text-gray-900 bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">CUIT / CUIL</label>
                        <input value={qrForm.cuit} onChange={e => setQrForm(p => ({ ...p, cuit: e.target.value }))}
                          placeholder="20-12345678-9" inputMode="numeric"
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-sm text-gray-900 bg-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                          {qrType === 'caja' ? 'N° de Caja' : qrType === 'sucursal' ? 'Nombre Sucursal' : 'Local / Punto'}
                        </label>
                        <input value={qrForm.branchName} onChange={e => setQrForm(p => ({ ...p, branchName: e.target.value }))}
                          placeholder={qrType === 'caja' ? 'Caja 1' : qrType === 'sucursal' ? 'Sucursal Centro' : 'Local Principal'}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-sm text-gray-900 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Dirección del local</label>
                      <input value={qrForm.address} onChange={e => setQrForm(p => ({ ...p, address: e.target.value }))}
                        placeholder="Av. Corrientes 1234, CABA"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-sm text-gray-900 bg-white" />
                    </div>

                    {/* Producto (para QR producto) */}
                    {qrType === 'producto' && (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre del producto *</label>
                        <input value={qrForm.productName} onChange={e => setQrForm(p => ({ ...p, productName: e.target.value }))}
                          placeholder="Ej: Remera talle M negra"
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-400 outline-none text-sm text-gray-900 bg-white" />
                      </div>
                    )}

                    {/* Monto fijo */}
                    {(qrType === 'precio_fijo' || qrType === 'producto') && (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Precio {qrType === 'producto' ? '(opcional)' : '*'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                          <input type="number" value={qrForm.amount} onChange={e => setQrForm(p => ({ ...p, amount: e.target.value }))}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-amber-400 outline-none text-sm font-bold text-gray-900 bg-white"
                            placeholder="0.00" />
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          {[500, 1000, 2500, 5000, 10000].map(v => (
                            <button key={v} type="button" onClick={() => setQrForm(p => ({ ...p, amount: String(v) }))}
                              className="flex-1 py-1 rounded-lg text-[10px] font-bold transition-all"
                              style={{ background: qrForm.amount === String(v) ? '#F59E0B' : '#F1F5F9', color: qrForm.amount === String(v) ? '#fff' : '#64748B' }}>
                              ${(v/1000).toFixed(0)}K
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descripción */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Descripción (opcional)</label>
                      <input value={qrForm.description} onChange={e => setQrForm(p => ({ ...p, description: e.target.value }))}
                        placeholder={qrType === 'comercio' ? 'Ej: Aceptamos pagos digitales' : qrType === 'producto' ? 'Talla, color, etc.' : ''}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-sm text-gray-900 bg-white" />
                    </div>

                    {/* Info chip */}
                    {QR_TYPE_CONFIG[qrType].permanent && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 text-xs text-blue-700">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>QR permanente — nunca expira, podés usarlo indefinidamente</span>
                      </div>
                    )}
                    {!QR_TYPE_CONFIG[qrType].permanent && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-xs text-amber-700">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>QR temporal — expira en 30 minutos, uso único</span>
                      </div>
                    )}
                  </div>

                  <button onClick={handleGenerateQR} disabled={qrGenerating}
                    className="mt-4 w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${QR_TYPE_CONFIG[qrType].color}, ${QR_TYPE_CONFIG[qrType].color}BB)` }}>
                    {qrGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</> : <><QrCode className="w-4 h-4" /> Crear QR</>}
                  </button>
                </div>

                {/* CVU identidad */}
                <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Tu identidad de cobro</p>
                  <div className="space-y-2 text-sm">
                    <div><p className="text-[10px] text-gray-400">CVU</p><p className="font-mono text-gray-900 text-xs break-all">{wallet?.cvu || '—'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Alias</p><p className="font-bold text-blue-600 text-sm">{wallet?.alias || '—'}</p></div>
                    <div><p className="text-[10px] text-gray-400">N° Cuenta</p><p className="font-mono text-gray-700 text-xs">{wallet?.accountNumber || '—'}</p></div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: QRs guardados ── */}
              <div className="lg:col-span-3 space-y-4">

                {/* Vista previa del QR recién creado */}
                {qrPreview && (
                  <div className="rounded-3xl overflow-hidden" style={{ border: '2px solid #3B82F6', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#EFF6FF' }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-700">QR creado y guardado</span>
                      </div>
                      <button onClick={() => setQrPreview(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    {/* Display QR card — estilo MercadoPago cartel mostrador */}
                    <div className="bg-white p-5 flex gap-5 items-start">
                      <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 160, border: '1px solid #E2E8F0' }}>
                        {/* Header azul */}
                        <div className="px-3 py-2 text-center" style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' }}>
                          <p className="text-white font-black text-[10px] uppercase tracking-widest">⚡ PAGO SIMPLE</p>
                          <p className="text-white font-bold text-xs truncate mt-0.5">{qrPreview.businessName || user?.name}</p>
                          {qrPreview.branchName && <p className="text-blue-200 text-[9px]">{qrPreview.branchName}</p>}
                        </div>
                        {/* QR image */}
                        <div className="bg-white p-3 flex justify-center">
                          {qrPreview.qrImageBase64 ? (
                            <img src={qrPreview.qrImageBase64} alt="QR" className="w-28 h-28 rounded-lg" />
                          ) : (
                            <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center"><QrCode className="w-10 h-10 text-gray-300" /></div>
                          )}
                        </div>
                        {/* Footer */}
                        <div className="px-3 py-2 text-center" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                          <p className="text-blue-700 font-black text-[10px] uppercase tracking-wide">Escaneá para pagar</p>
                          {qrPreview.amount ? (
                            <p className="text-gray-900 font-black text-sm mt-0.5">${Number(qrPreview.amount).toLocaleString('es-AR')}</p>
                          ) : (
                            <p className="text-gray-500 text-[9px] mt-0.5">Monto libre</p>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <p className="text-xs text-gray-400">Tipo</p>
                          <p className="font-bold text-gray-900">{QR_TYPE_CONFIG[qrPreview.qrType]?.label}</p>
                        </div>
                        {qrPreview.cuit && <div><p className="text-xs text-gray-400">CUIT</p><p className="font-mono text-gray-900 text-sm">{qrPreview.cuit}</p></div>}
                        {qrPreview.address && <div><p className="text-xs text-gray-400">Dirección</p><p className="text-gray-700 text-sm">{qrPreview.address}</p></div>}
                        <div><p className="text-xs text-gray-400">Código</p><p className="font-mono text-gray-700 text-xs">{qrPreview.qrCode}</p></div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qrPreview.isPermanent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {qrPreview.isPermanent ? '● Permanente' : '⏱ 30 min'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button onClick={() => downloadQR(qrPreview)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-700">
                            <Download className="w-3 h-3" /> PNG
                          </button>
                          <button onClick={() => downloadQR(qrPreview, true)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-200 hover:bg-blue-50 text-blue-700">
                            <Download className="w-3 h-3" /> Imprimir cartel
                          </button>
                          <button onClick={() => copyQRLink(qrPreview)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-700">
                            {qrCopied === qrPreview.qrCode ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {qrCopied === qrPreview.qrCode ? 'Copiado' : 'Copiar link'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de QRs guardados */}
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                    Mis QRs guardados {!qrLoading && `(${qrSaved.length})`}
                  </h2>
                  <button onClick={fetchMyQRs} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Actualizar
                  </button>
                </div>

                {qrLoading && (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" style={{ border: '1px solid #E2E8F0' }} />)}</div>
                )}

                {!qrLoading && qrSaved.length === 0 && (
                  <div className="bg-white rounded-3xl p-16 text-center" style={{ border: '2px dashed #E2E8F0' }}>
                    <QrCode className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-bold">Creá tu primer QR</p>
                    <p className="text-gray-400 text-sm mt-1">Los QRs se guardan automáticamente aquí</p>
                  </div>
                )}

                {qrSaved.map((qr) => {
                  const cfg = QR_TYPE_CONFIG[qr.qrType] || QR_TYPE_CONFIG.comercio;
                  return (
                    <div key={qr.id} className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-md"
                      style={{ border: `2px solid ${cfg.color}25` }}>
                      <div className="flex gap-0">
                        {/* Mini display QR */}
                        <div className="flex-shrink-0 flex flex-col" style={{ width: 110, background: `linear-gradient(180deg, #1D4ED8, #3B82F6)` }}>
                          <div className="px-2 py-2 text-center">
                            <p className="text-white text-[8px] font-black uppercase tracking-widest">⚡ PAGO SIMPLE</p>
                            <p className="text-white text-[9px] font-bold truncate mt-0.5">{qr.businessName || user?.name}</p>
                            {qr.branchName && <p className="text-blue-200 text-[8px] truncate">{qr.branchName}</p>}
                          </div>
                          <div className="flex-1 bg-white mx-1.5 mb-1.5 rounded-lg p-1.5 flex items-center justify-center">
                            {qr.qrImageBase64 ? (
                              <img src={qr.qrImageBase64} alt="QR" className="w-full rounded" />
                            ) : <QrCode className="w-8 h-8 text-gray-300" />}
                          </div>
                          <div className="bg-white mx-1.5 mb-1.5 rounded-lg py-1 text-center">
                            <p className="text-blue-700 font-black text-[8px]">ESCANEÁ</p>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-3 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">● Activo</span>
                              {qr.isPermanent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Permanente</span>}
                            </div>
                          </div>

                          <p className="font-black text-gray-900 text-base leading-tight">
                            {qr.businessName || user?.name}
                          </p>
                          {qr.branchName && <p className="text-xs text-gray-500">{qr.branchName}</p>}
                          {qr.cuit && <p className="text-xs text-gray-400 font-mono">CUIT: {qr.cuit}</p>}

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="font-bold text-gray-900">
                              {qr.amount ? `$${Number(qr.amount).toLocaleString('es-AR')}` : 'Monto libre'}
                            </span>
                            {qr.paymentCount > 0 && <span className="text-green-600">{qr.paymentCount} pago{qr.paymentCount > 1 ? 's' : ''}</span>}
                            {qr.totalCollected > 0 && <span className="text-blue-600">${Number(qr.totalCollected).toLocaleString('es-AR')}</span>}
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            <button onClick={() => { setQrPreview(qr); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-gray-200 hover:bg-gray-50 text-gray-700">
                              <QrCode className="w-3 h-3" /> Ver
                            </button>
                            <button onClick={() => downloadQR(qr)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-gray-200 hover:bg-gray-50 text-gray-700">
                              <Download className="w-3 h-3" /> PNG
                            </button>
                            <button onClick={() => downloadQR(qr, true)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-blue-200 hover:bg-blue-50 text-blue-700">
                              <Download className="w-3 h-3" /> Cartel
                            </button>
                            <button onClick={() => copyQRLink(qr)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-gray-200 hover:bg-gray-50 text-gray-700">
                              {qrCopied === qr.qrCode ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                              {qrCopied === qr.qrCode ? 'Copiado' : 'Link'}
                            </button>
                            {/* Eliminar — con confirmación */}
                            {qrDeleteConfirm === qr.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDeleteQR(qr.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-red-600 text-white">
                                  Confirmar eliminar
                                </button>
                                <button onClick={() => setQrDeleteConfirm('')}
                                  className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-gray-200 text-gray-500">
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setQrDeleteConfirm(qr.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-red-200 hover:bg-red-50 text-red-500">
                                <Trash2 className="w-3 h-3" /> Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====== SERVICIOS ====== */}
          {activeTab === 'servicios' && (
            <div className="grid lg:grid-cols-5 gap-5">

              {/* ── Columna principal ── */}
              <div className="lg:col-span-3">

                {/* Breadcrumb / pasos */}
                {svcStep !== 'categoria' && svcStep !== 'comprobante' && (
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    {[
                      { s: 'categoria', label: 'Categoría' },
                      { s: 'empresa', label: 'Empresa' },
                      { s: 'datos', label: 'Datos' },
                      { s: 'factura', label: 'Factura' },
                      { s: 'confirmacion', label: 'Confirmar' },
                    ].map((item, i, arr) => {
                      const steps: SvcStep[] = ['categoria','empresa','datos','factura','confirmacion'];
                      const cur = steps.indexOf(svcStep);
                      const idx = steps.indexOf(item.s as SvcStep);
                      return (
                        <div key={item.s} className="flex items-center gap-2">
                          <button onClick={() => idx < cur ? setSvcStep(item.s as SvcStep) : undefined}
                            className="text-xs font-bold px-3 py-1 rounded-full transition-all"
                            style={{ background: idx === cur ? '#3B82F6' : idx < cur ? '#DBEAFE' : '#F1F5F9', color: idx === cur ? '#fff' : idx < cur ? '#1D4ED8' : '#9CA3AF', cursor: idx < cur ? 'pointer' : 'default' }}>
                            {i + 1}. {item.label}
                          </button>
                          {i < arr.length - 1 && <span className="text-gray-300 text-xs">›</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PASO 1: Categoría + búsqueda global */}
                {svcStep === 'categoria' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-black text-gray-900 text-xl mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Pagar servicios y recargas</h3>
                      <p className="text-gray-400 text-sm">Facturas, recargas, billeteras y más — al instante desde tu billetera</p>
                    </div>

                    {/* Búsqueda global de empresas */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={svcSearch}
                        onChange={e => setSvcSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white text-sm"
                        placeholder="Buscar empresa: Edenor, Personal, OSDE, MercadoPago..."
                      />
                      {svcSearch && (
                        <button onClick={() => setSvcSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Resultados de búsqueda */}
                    {svcSearch.length >= 2 && (() => {
                      const q = svcSearch.toLowerCase();
                      const results: { company: typeof SERVICES_BY_CAT['luz'][0]; catId: string }[] = [];
                      Object.entries(SERVICES_BY_CAT).forEach(([catId, companies]) => {
                        companies.forEach(c => { if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) results.push({ company: c, catId }); });
                      });
                      return results.length > 0 ? (
                        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-2">{results.length} resultado{results.length > 1 ? 's' : ''}</p>
                          {results.map(({ company, catId }) => {
                            const cat = SERVICE_CATEGORIES.find(c => c.id === catId);
                            return (
                              <button key={company.code} onClick={() => { setSvcCat(catId); setSvcCompany(company); setSvcStep('datos'); setSvcSearch(''); }}
                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-50">
                                <span className="text-xl">{company.logo}</span>
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 text-sm">{company.name}</p>
                                  <p className="text-xs text-gray-400">{cat?.label} · {company.modes.join(' · ')}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl p-4 text-center" style={{ border: '1px solid #E2E8F0' }}>
                          <p className="text-gray-400 text-sm">Sin resultados para "{svcSearch}"</p>
                        </div>
                      );
                    })()}

                    {/* Grid de categorías */}
                    {!svcSearch && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {SERVICE_CATEGORIES.map(({ id, label, icon: Icon, color, bg }) => (
                          <button key={id} onClick={() => { setSvcCat(id); setSvcStep('empresa'); }}
                            className="p-4 rounded-2xl bg-white text-center transition-all hover:shadow-md hover:-translate-y-0.5"
                            style={{ border: '1px solid #E2E8F0' }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
                              <Icon className="w-6 h-6" style={{ color }} />
                            </div>
                            <p className="text-sm font-bold text-gray-800 leading-tight">{label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{(SERVICES_BY_CAT[id] || []).length} opciones</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PASO 2: Empresa */}
                {svcStep === 'empresa' && (() => {
                  const catInfo = SERVICE_CATEGORIES.find(c => c.id === svcCat);
                  const allCompanies = SERVICES_BY_CAT[svcCat] || [];
                  const q = svcSearch.toLowerCase();
                  const filtered = q.length >= 1 ? allCompanies.filter(c => c.name.toLowerCase().includes(q)) : allCompanies;
                  return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => { setSvcStep('categoria'); setSvcSearch(''); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <ArrowDownLeft className="w-4 h-4 text-gray-500 rotate-45" />
                      </button>
                      <div className="flex items-center gap-3">
                        {catInfo && <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: catInfo.bg }}><catInfo.icon className="w-5 h-5" style={{ color: catInfo.color }} /></div>}
                        <div>
                          <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Raleway, sans-serif' }}>Elegí la empresa</h3>
                          <p className="text-gray-400 text-xs">{catInfo?.label} · {allCompanies.length} opciones</p>
                        </div>
                      </div>
                    </div>

                    {/* Búsqueda por categoría */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={svcSearch} onChange={e => setSvcSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white text-sm"
                        placeholder={`Buscar en ${catInfo?.label}...`} />
                      {svcSearch && <button onClick={() => setSvcSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"><X className="w-3.5 h-3.5" /></button>}
                    </div>

                    <div className="space-y-2">
                      {filtered.length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-sm">Sin resultados para "{svcSearch}"</div>
                      )}
                      {filtered.map(company => (
                        <button key={company.code} onClick={() => { setSvcCompany(company); setSvcStep('datos'); setSvcSearch(''); }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                          style={{ border: '1px solid #E2E8F0' }}>
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ border: '1px solid #E2E8F0' }}>{company.logo}</div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{company.name}</p>
                            <p className="text-xs text-gray-400">{company.modes.join(' · ')} · {company.inputLabel}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                  );
                })()}

                {/* PASO 3: Datos de la cuenta */}
                {svcStep === 'datos' && svcCompany && (() => {
                  const isRecarga = svcCompany.modes[0] === 'Recarga';
                  return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setSvcStep('empresa')} className="p-2 rounded-xl hover:bg-gray-100">
                        <ArrowDownLeft className="w-4 h-4 text-gray-500 rotate-45" />
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{svcCompany.logo}</span>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Raleway, sans-serif' }}>{svcCompany.name}</h3>
                          <p className="text-gray-400 text-xs">{isRecarga ? 'Recarga prepaga' : 'Consulta de factura'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Si es recarga: monto + número directo */}
                    {isRecarga ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{svcCompany.inputLabel}</label>
                          <input value={svcAccount} onChange={e => setSvcAccount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white font-mono text-xl"
                            placeholder="11 1234-5678" type="tel" />
                          <p className="text-xs text-gray-400 mt-2">Ingresá el número sin el 0 inicial ni el 15</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Monto de recarga</label>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {(svcCompany.rechargeAmounts || [100, 200, 300, 500, 1000]).map(v => (
                              <button key={v} type="button" onClick={() => { setSvcRechargeAmount(String(v)); setSvcCustomAmount(''); }}
                                className="py-3 rounded-xl font-bold text-sm transition-all"
                                style={{ background: svcRechargeAmount === String(v) ? '#3B82F6' : '#F1F5F9', color: svcRechargeAmount === String(v) ? '#fff' : '#374151' }}>
                                ${v.toLocaleString('es-AR')}
                              </button>
                            ))}
                          </div>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                            <input type="number" value={svcCustomAmount} onChange={e => { setSvcCustomAmount(e.target.value); setSvcRechargeAmount(''); }}
                              className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white font-bold"
                              placeholder="Otro monto" />
                          </div>
                        </div>
                        <button onClick={() => setSvcStep('confirmacion')} disabled={(!svcAccount) || (!svcRechargeAmount && !svcCustomAmount)}
                          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                          <CheckCircle className="w-5 h-5" /> Continuar
                        </button>
                      </div>
                    ) : (
                      /* Si es factura: selector de modo de ingreso */
                      <>
                        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: '#F1F5F9' }}>
                          {[
                            { id: 'account' as const, label: 'N° de cuenta', icon: '🔢' },
                            { id: 'barcode' as const, label: 'Código de barras', icon: '📊' },
                            { id: 'camera' as const, label: 'Cámara', icon: '📷' },
                          ].map(m => (
                            <button key={m.id} onClick={() => { setSvcMode(m.id); if (m.id === 'camera') setSvcCameraActive(true); else setSvcCameraActive(false); }}
                              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                              style={{ background: svcMode === m.id ? '#fff' : 'transparent', color: svcMode === m.id ? '#1D4ED8' : '#64748B', boxShadow: svcMode === m.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                              {m.icon} {m.label}
                            </button>
                          ))}
                        </div>

                        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                          {svcMode === 'account' && (
                            <div className="space-y-3">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">{svcCompany.inputLabel}</label>
                              <input value={svcAccount} onChange={e => setSvcAccount(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white font-mono text-xl"
                                placeholder="Ej: 12345678" />
                              <p className="text-xs text-gray-400">Encontralo en la parte superior de tu factura impresa</p>
                            </div>
                          )}
                          {svcMode === 'barcode' && (
                            <div className="space-y-3">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Código de barras numérico</label>
                              <input value={svcBarcode} onChange={e => processBarcodeInput(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white font-mono text-base"
                                placeholder="Ingresá los 20-30 dígitos del código de barras"
                                inputMode="numeric" />
                              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-xs text-amber-700">
                                <span>📊</span>
                                <div>
                                  <p className="font-bold mb-0.5">¿Dónde está el código?</p>
                                  <p>En la parte inferior de tu factura física, debajo del código de barras visual. Son los números largos (20-30 dígitos).</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {svcMode === 'camera' && (
                            <div className="space-y-3">
                              <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center relative" style={{ minHeight: 180 }}>
                                {svcCameraActive ? (
                                  <div className="text-center text-white p-6">
                                    <div className="w-16 h-16 border-4 border-white/30 rounded-2xl mx-auto mb-3 relative">
                                      <div className="absolute inset-2 border-2 border-white animate-pulse rounded-lg" />
                                    </div>
                                    <p className="text-sm font-semibold mb-1">Apuntá al código de barras</p>
                                    <p className="text-xs text-white/60">El escáner detecta automáticamente</p>
                                    <p className="text-xs text-yellow-300 mt-3">⚠ La cámara real requiere HTTPS en producción</p>
                                  </div>
                                ) : (
                                  <button onClick={() => setSvcCameraActive(true)}
                                    className="text-white text-center p-6">
                                    <div className="text-4xl mb-2">📷</div>
                                    <p className="text-sm">Activar cámara</p>
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 text-center">O ingresá el código manualmente:</p>
                              <input value={svcBarcode} onChange={e => processBarcodeInput(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-gray-900 bg-white font-mono text-sm"
                                placeholder="Código detectado aparecerá aquí" inputMode="numeric" />
                            </div>
                          )}
                        </div>

                        <button onClick={lookupServiceBill} disabled={svcLooking || (!svcAccount && !svcBarcode)}
                          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                          {svcLooking ? <><Loader2 className="w-5 h-5 animate-spin" /> Consultando factura...</> : <><FileText className="w-5 h-5" /> Consultar factura</>}
                        </button>
                      </>
                    )}
                  </div>
                  );
                })()}

                {/* PASO 4: Factura encontrada */}
                {svcStep === 'factura' && svcBill && svcCompany && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setSvcStep('datos')} className="p-2 rounded-xl hover:bg-gray-100">
                        <ArrowDownLeft className="w-4 h-4 text-gray-500 rotate-45" />
                      </button>
                      <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Raleway, sans-serif' }}>Detalle de factura</h3>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '2px solid #E2E8F0' }}>
                      {/* Header empresa */}
                      <div className="p-5 flex items-center justify-between" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{svcCompany.logo}</span>
                          <div>
                            <p className="font-black text-gray-900">{svcCompany.name}</p>
                            <p className="text-xs text-gray-400">Cuenta: {svcAccount || svcBarcode}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${svcBill.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {svcBill.status === 'overdue' ? '⚠ Vencida' : '✓ Al día'}
                        </span>
                      </div>
                      {/* Detalle */}
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">N° Factura</span><span className="font-mono font-bold text-gray-900">{svcBill.invoiceId}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Período</span><span className="font-semibold text-gray-900 capitalize">{svcBill.period}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Vencimiento</span><span className={`font-bold ${svcBill.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>{svcBill.dueDate}</span></div>
                        <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                          <span className="text-gray-500 font-medium">Total a pagar</span>
                          <span className="font-black text-2xl text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                            ${Number(svcBill.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Monto personalizado */}
                    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Monto a pagar</p>
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setSvcCustomAmount('')}
                          className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                          style={{ background: !svcCustomAmount ? '#3B82F6' : '#F1F5F9', color: !svcCustomAmount ? '#fff' : '#64748B' }}>
                          Total: ${Number(svcBill.amount).toLocaleString('es-AR')}
                        </button>
                        <button onClick={() => setSvcCustomAmount(String(Math.floor(svcBill.amount / 2)))}
                          className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                          style={{ background: svcCustomAmount === String(Math.floor(svcBill.amount / 2)) ? '#3B82F6' : '#F1F5F9', color: svcCustomAmount === String(Math.floor(svcBill.amount / 2)) ? '#fff' : '#64748B' }}>
                          Pago parcial
                        </button>
                      </div>
                      {svcCustomAmount !== '' && (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                          <input type="number" value={svcCustomAmount} onChange={e => setSvcCustomAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-blue-300 focus:border-blue-500 outline-none text-gray-900 bg-white font-bold"
                            placeholder="Ingresá el monto" />
                        </div>
                      )}
                    </div>

                    <button onClick={() => setSvcStep('confirmacion')}
                      className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                      <CheckCircle className="w-5 h-5" /> Continuar al pago
                    </button>
                  </div>
                )}

                {/* PASO 5: Confirmación */}
                {svcStep === 'confirmacion' && svcCompany && (() => {
                  const isRecarga = svcCompany.modes[0] === 'Recarga';
                  const finalAmount = isRecarga
                    ? (parseFloat(svcRechargeAmount) || parseFloat(svcCustomAmount) || 0)
                    : (parseFloat(svcCustomAmount) || svcBill?.amount || 0);
                  const insufficient = finalAmount > balance;
                  return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setSvcStep(isRecarga ? 'datos' : 'factura')} className="p-2 rounded-xl hover:bg-gray-100">
                        <ArrowDownLeft className="w-4 h-4 text-gray-500 rotate-45" />
                      </button>
                      <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Raleway, sans-serif' }}>
                        {isRecarga ? 'Confirmar recarga' : 'Confirmar pago'}
                      </h3>
                    </div>

                    <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '2px solid #E2E8F0' }}>
                      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <span className="text-3xl">{svcCompany.logo}</span>
                        <div>
                          <p className="font-black text-gray-900">{svcCompany.name}</p>
                          <p className="text-sm text-gray-500">
                            {isRecarga ? `Número: ${svcAccount}` : `Cuenta: ${svcAccount || svcBarcode}`}
                          </p>
                        </div>
                        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          {isRecarga ? 'Recarga' : 'Factura'}
                        </span>
                      </div>
                      {isRecarga ? [
                        { label: 'Operador', val: svcCompany.name },
                        { label: 'Número destino', val: svcAccount },
                        { label: 'Tipo', val: 'Recarga prepaga' },
                        { label: 'Método', val: 'Pago Simple · Billetera' },
                        { label: 'Saldo disponible', val: `$${Number(balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-semibold text-gray-900">{val}</span>
                        </div>
                      )) : svcBill ? [
                        { label: 'N° Factura', val: svcBill.invoiceId },
                        { label: 'Período', val: svcBill.period },
                        { label: 'Vencimiento', val: svcBill.dueDate },
                        { label: 'Método de pago', val: 'Pago Simple · Billetera' },
                        { label: 'Saldo disponible', val: `$${Number(balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-semibold text-gray-900">{val}</span>
                        </div>
                      )) : null}
                      <div className="flex justify-between items-center pt-4" style={{ borderTop: '2px solid #F1F5F9' }}>
                        <span className="font-bold text-gray-700">{isRecarga ? 'Monto a recargar' : 'Total a debitar'}</span>
                        <span className="font-black text-3xl text-blue-600" style={{ fontFamily: 'Raleway, sans-serif' }}>
                          ${finalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {insufficient && (
                      <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2" style={{ border: '1px solid #FECACA' }}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> Saldo insuficiente. Cargá saldo antes de continuar.
                      </div>
                    )}

                    <button onClick={payService} disabled={svcPaying || insufficient || finalAmount <= 0}
                      className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: isRecarga ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                      {svcPaying ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</> : <><Shield className="w-5 h-5" /> {isRecarga ? 'Confirmar recarga' : 'Pagar ahora'}</>}
                    </button>
                    <p className="text-center text-xs text-gray-400">🔒 {isRecarga ? 'Recarga segura' : 'Pago seguro'} procesado por Pago Simple</p>
                  </div>
                  );
                })()}

                {/* PASO 6: Comprobante */}
                {svcStep === 'comprobante' && svcVoucher && (
                  <div className="space-y-4">
                    {/* Éxito */}
                    <div className="bg-white rounded-3xl p-8 text-center" style={{ border: '2px solid #10B981' }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#D1FAE5' }}>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-black text-gray-900 text-2xl mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>¡Pago exitoso!</h3>
                      <p className="text-gray-500 text-sm mb-6">Tu pago fue procesado correctamente</p>

                      {/* Comprobante estilo bancario */}
                      <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-2.5 text-sm" style={{ border: '1px solid #E2E8F0' }}>
                        <div className="flex justify-between"><span className="text-gray-500">Operación</span><span className="font-mono font-bold text-gray-900">{svcVoucher.operationId}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Empresa</span><span className="font-bold text-gray-900">{svcVoucher.company}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Cuenta</span><span className="font-mono text-gray-900">{svcVoucher.account}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Importe</span><span className="font-black text-green-600">${Number(svcVoucher.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Fecha</span><span className="text-gray-900">{svcVoucher.date}</span></div>
                        <div className="flex justify-between pt-2" style={{ borderTop: '1px dashed #E2E8F0' }}><span className="text-gray-500">Código de autorización</span><span className="font-mono font-bold text-blue-600">{svcVoucher.authCode}</span></div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        {svcVoucher && (
                          <button onClick={() => {
                            const params = encodeURIComponent(JSON.stringify(svcVoucher));
                            router.push(`/comprobante-servicio?data=${params}`);
                          }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                            <Download className="w-4 h-4" /> Ver comprobante
                          </button>
                        )}
                        <button onClick={resetSvcFlow}
                          className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                          Nuevo pago
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sidebar derecha ── */}
              <div className="lg:col-span-2 space-y-4">
                {/* Saldo */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Saldo disponible</p>
                  <p className="font-black text-3xl text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>{formatPrice(balance)}</p>
                  <p className="text-gray-400 text-xs mt-1">ARS · Pesos argentinos</p>
                  <button onClick={() => setActiveTab('depositar')} className="mt-3 w-full py-2 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                    + Cargar saldo
                  </button>
                </div>

                {/* Info API */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Servicios disponibles</p>
                  <div className="space-y-2">
                    {SERVICE_CATEGORIES.map(({ id, label, icon: Icon, color }) => (
                      <button key={id} onClick={() => { setSvcCat(id); setSvcStep('empresa'); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-gray-50 transition-colors">
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <span className="ml-auto text-xs text-gray-400">{(SERVICES_BY_CAT[id] || []).length}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Historial de pagos de servicio */}
                {svcHistory.length > 0 && (
                  <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Pagos recientes</p>
                    <div className="space-y-2">
                      {svcHistory.slice(0, 5).map(v => (
                        <div key={v.operationId} className="flex items-center justify-between py-1.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{v.company}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{v.operationId}</p>
                          </div>
                          <span className="text-sm font-bold text-red-500 flex-shrink-0 ml-2">-${Number(v.amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nota sobre API real */}
                <div className="rounded-2xl p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-xs font-bold text-green-700 mb-1.5">🔗 Integración con Rapipago</p>
                  <p className="text-xs text-green-600">Este módulo implementa los mismos endpoints de la <strong>API Rapipago</strong> (billing-digital-api + payments-digital-api). Para conectar con datos reales, activá las credenciales en producción.</p>
                </div>
              </div>
            </div>
          )}

          {/* ====== PEDIDOS ====== */}
          {activeTab === 'pedidos' && (
            <div>
              {ordersLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" style={{ border: '1px solid #E2E8F0' }} />)}</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #E2E8F0' }}>
                  <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Sin pedidos aún</h3>
                  <p className="text-gray-400 text-sm mb-5">Cuando realices una compra, aparecerá aquí</p>
                  <Link href="/productos" className="inline-flex px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>Explorar productos</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>{formatPrice(order.total)}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>{order.status}</span>
                        </div>
                      </div>
                      {order.items?.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{item.productTitle}</span>
                          <span className="text-gray-400 flex-shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ====== PERFIL ====== */}
          {activeTab === 'perfil' && (
            <div className="max-w-lg">
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
                <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Raleway, sans-serif' }}>{user?.name}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize" style={{ background: '#D1FAE5', color: '#059669' }}>{user?.role}</span>
                  </div>
                </div>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {[
                    { label: 'Nombre completo', field: 'name', placeholder: 'Tu nombre' },
                    { label: 'Teléfono', field: 'phone', placeholder: '+54 11 1234-5678' },
                    { label: 'Dirección', field: 'address', placeholder: 'Av. Corrientes 1234' },
                    { label: 'Ciudad', field: 'city', placeholder: 'Buenos Aires' },
                    { label: 'Provincia', field: 'province', placeholder: 'CABA' },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                      <input value={(profileForm as any)[field]} onChange={(e) => setProfileForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="input-wallet w-full"
                        placeholder={placeholder} />
                    </div>
                  ))}
                  <button type="submit" disabled={savingProfile} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                    {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ====== SEGURIDAD ====== */}
          {activeTab === 'seguridad' && (
            <div className="max-w-lg">
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                    <Shield className="w-5 h-5" style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>Cambiar contraseña</h3>
                    <p className="text-gray-400 text-sm">Usá una contraseña segura de al menos 8 caracteres</p>
                  </div>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[
                    { label: 'Contraseña actual', field: 'current' as const, key: 'current' as const },
                    { label: 'Nueva contraseña', field: 'new' as const, key: 'new' as const },
                    { label: 'Confirmar contraseña', field: 'confirm' as const, key: null as null },
                  ].map(({ label, field, key }) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                      <div className="relative">
                        <input type={key && showPw[key] ? 'text' : 'password'} value={pwForm[field]}
                          onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                          className="input-wallet w-full pr-11"
                          placeholder="••••••••" />
                        {key && (
                          <button type="button" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                            {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                    Cambiar contraseña
                  </button>
                </form>

                {/* Account info */}
                <div className="mt-5 pt-5 space-y-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Autenticación de dos factores</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>Próximamente</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Estado de cuenta</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#D1FAE5', color: '#059669' }}>Activa</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== FAVORITOS ====== */}
          {activeTab === 'favoritos' && (
            <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #E2E8F0' }}>
              <Heart className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h3 className="font-black text-gray-900 text-xl mb-2">Mis favoritos</h3>
              <p className="text-gray-400 mb-5">Guardá los productos que más te gustan para comprarlos después</p>
              <Link href="/perfil/favoritos" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                Ver favoritos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ====== MENSAJES ====== */}
          {activeTab === 'mensajes' && (
            <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #E2E8F0' }}>
              <MessageCircle className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="font-black text-gray-900 text-xl mb-2">Centro de Mensajes</h3>
              <p className="text-gray-400 mb-5">Chateá directamente con vendedores y compradores</p>
              <Link href="/chat" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                Abrir chat <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ====== NOTIFICACIONES ====== */}
          {activeTab === 'notificaciones' && (
            <NotificacionesTab />
          )}

          {/* ====== DIRECCIONES ====== */}
          {activeTab === 'direcciones' && (
            <DireccionesTab />
          )}

          {/* ====== CONFIGURACION ====== */}
          {activeTab === 'configuracion' && (
            <ConfiguracionTab />
          )}

        </div>
      </div>
    </div>
  );
}

// ===== NOTIFICACIONES COMPONENT =====
function NotificacionesTab() {
  const [prefs, setPrefs] = useState({
    compras: true, ventas: true, ofertas: true, noticias: false,
    email_compras: true, email_ventas: true, email_marketing: false,
    push_app: true, push_web: false,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Preferencias guardadas');
  };

  const NOTIF_SECTIONS = [
    {
      title: 'Notificaciones en la app',
      items: [
        { key: 'compras' as const, label: 'Actualizaciones de mis compras', desc: 'Envíos, confirmaciones y cambios de estado' },
        { key: 'ventas' as const, label: 'Actividad de mis ventas', desc: 'Nuevas órdenes, preguntas y pagos' },
        { key: 'ofertas' as const, label: 'Ofertas especiales', desc: 'Descuentos y promociones relevantes' },
        { key: 'noticias' as const, label: 'Novedades de Mercado Simple', desc: 'Nuevas funciones y actualizaciones' },
      ],
    },
    {
      title: 'Notificaciones por email',
      items: [
        { key: 'email_compras' as const, label: 'Resumen de mis compras', desc: 'Confirmaciones y actualizaciones por correo' },
        { key: 'email_ventas' as const, label: 'Actividad de mis ventas', desc: 'Resumen diario de ventas' },
        { key: 'email_marketing' as const, label: 'Ofertas y promociones', desc: 'Newsletter con descuentos exclusivos' },
      ],
    },
    {
      title: 'Notificaciones push',
      items: [
        { key: 'push_app' as const, label: 'Notificaciones en la app móvil', desc: 'Actualizaciones instantáneas' },
        { key: 'push_web' as const, label: 'Notificaciones en el navegador', desc: 'Alertas en tiempo real' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {NOTIF_SECTIONS.map(section => (
        <div key={section.title} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" /> {section.title}
          </h3>
          <div className="space-y-4">
            {section.items.map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button onClick={() => toggle(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${prefs[item.key] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${prefs[item.key] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={save} disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
        {saving ? 'Guardando...' : 'Guardar preferencias'}
      </button>
    </div>
  );
}

// ===== DIRECCIONES COMPONENT =====
function DireccionesTab() {
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Casa', street: 'Av. Corrientes 1234', city: 'Buenos Aires', province: 'CABA', cp: '1043', isDefault: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', street: '', city: '', province: '', cp: '' });

  const save = () => {
    if (!form.street || !form.city) { toast.error('Completá los campos obligatorios'); return; }
    setAddresses(prev => [...prev, { ...form, id: Date.now().toString(), isDefault: false }]);
    setForm({ label: '', street: '', city: '', province: '', cp: '' });
    setShowForm(false);
    toast.success('Dirección guardada');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" /> Mis direcciones
          </h3>
          <button onClick={() => setShowForm(p => !p)}
            className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{addr.label || 'Sin nombre'}</p>
                    {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Predeterminada</span>}
                  </div>
                  <p className="text-xs text-gray-500">{addr.street}, {addr.city}, {addr.province} ({addr.cp})</p>
                </div>
              </div>
              <button onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="mt-4 p-4 border border-dashed border-blue-300 rounded-xl bg-blue-50 space-y-3">
            <p className="text-sm font-bold text-gray-900">Nueva dirección</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Etiqueta (Casa, Trabajo...)"
                className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
              <input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} placeholder="Calle y número *"
                className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
              <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Ciudad *"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
              <input value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} placeholder="Provincia"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
              <input value={form.cp} onChange={e => setForm(p => ({ ...p, cp: e.target.value }))} placeholder="Código postal"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Guardar dirección
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== CONFIGURACION COMPONENT =====
function ConfiguracionTab() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');
  const [currency, setCurrency] = useState('ARS');
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionNotif, setSessionNotif] = useState(true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Configuración guardada');
  };

  return (
    <div className="space-y-4">
      {/* Apariencia */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-500" /> Apariencia y preferencias
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Modo oscuro</p>
              <p className="text-xs text-gray-400">Cambiá el tema visual de la plataforma</p>
            </div>
            <button onClick={() => setDarkMode(p => !p)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${darkMode ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Idioma</p>
              <p className="text-xs text-gray-400">Seleccioná el idioma de la interfaz</p>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
              <option value="es">🇦🇷 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="pt">🇧🇷 Português</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Moneda</p>
              <p className="text-xs text-gray-400">Moneda para mostrar precios</p>
            </div>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
              <option value="ARS">ARS (Peso argentino)</option>
              <option value="USD">USD (Dólar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" /> Seguridad y acceso
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                Verificación en dos pasos
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Recomendado</span>
              </p>
              <p className="text-xs text-gray-400">Protegé tu cuenta con un segundo factor de autenticación</p>
            </div>
            <button onClick={() => setTwoFactor(p => !p)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${twoFactor ? 'bg-green-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${twoFactor ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Alerta por nuevo inicio de sesión</p>
              <p className="text-xs text-gray-400">Recibí un email cuando iniciés sesión desde un dispositivo nuevo</p>
            </div>
            <button onClick={() => setSessionNotif(p => !p)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${sessionNotif ? 'bg-green-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${sessionNotif ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Sesiones activas</p>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Este dispositivo</p>
                  <p className="text-xs text-gray-500">Sesión actual · Buenos Aires, AR</p>
                </div>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Activa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacidad */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-500" /> Privacidad
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Perfil público', desc: 'Otros usuarios pueden ver tu perfil', default: true },
            { label: 'Mostrar historial de compras', desc: 'Visible solo para vos', default: false },
            { label: 'Recibir ofertas personalizadas', desc: 'Basadas en tu actividad', default: true },
          ].map(item => {
            const [enabled, setEnabled] = useState(item.default);
            return (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button onClick={() => setEnabled(p => !p)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-purple-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${enabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cuenta */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-red-500" /> Gestión de cuenta
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Descargar mis datos</p>
              <p className="text-xs text-gray-400">Exportá toda tu información personal</p>
            </div>
            <button className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Solicitar
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-red-900">Cerrar sesión</p>
              <p className="text-xs text-red-400">Salir de tu cuenta en este dispositivo</p>
            </div>
            <button onClick={() => { logout(); router.push('/'); }}
              className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
        {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
}

export default function MiCuentaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <MiCuentaContent />
    </Suspense>
  );
}
