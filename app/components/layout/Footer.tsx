import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'
import { getSystemSettings } from "@/lib/actions/system"
import Image from 'next/image'

const footerLinks = {
  discover: [
    { name: 'Home', href: '/' },
    { name: 'Explore Projects', href: '/viewer' },
    { name: 'How it Works', href: '/about' },
  ],
  organization: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/team' },
    { name: 'Contact', href: 'mailto:ontrack.techsupport@gmail.com' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

export async function Footer() {
  const settings = await getSystemSettings();
  const orgName = settings.org_name || "OnTrack";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-brand text-white pt-16 pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4 mb-14">
          <div className="flex flex-col items-start md:items-center text-left md:text-center">
            <h3 className="text-xl font-bold mb-6 text-white">{orgName}</h3>
            <p className="text-sm text-white/80 leading-relaxed max-w-55 mb-4">
              Building the Future of<br className="hidden md:block" />
              Viscan Leadership, One<br className="hidden md:block" />
              Project at a Time.
            </p>
            {(settings.office_location || settings.contact_email) && (
              <div className="text-xs text-white space-y-1.5 mt-2">
                {settings.office_location && <p className="text-white">{settings.office_location}</p>}
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-gray-200 transition-colors block">
                    {settings.contact_email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start md:items-center text-left md:text-center">
            <h3 className="text-lg font-bold mb-6 text-white">Discover</h3>
            <ul className="space-y-4">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start md:items-center text-left md:text-center">
            <h3 className="text-lg font-bold mb-6 text-white">Organization</h3>
            <ul className="space-y-4">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start md:items-center text-left md:text-center">
            <h3 className="text-lg font-bold mb-6 text-white">Legal</h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full h-px bg-white/20 mb-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-1/3">
            <div className="bg-white rounded-full p-0.5">
              <Image src="/logov3.png" alt={`${orgName} Logo`} width={32} height={32} className="rounded-full" />
            </div>
            <span className="font-bold text-white md:hidden">{orgName}</span>
          </div>

          <div className="w-full md:w-1/3 text-center">
            <p className="text-xs text-white/90">
              © {currentYear} {orgName}. All rights reserved.
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-1/3">
            {settings.social_fb && (
              <a 
                href={settings.social_fb} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={`Visit our Facebook page`}
              >
                <Facebook className="w-4 h-4 text-white" fill="currentColor" />
              </a>
            )}
            
            {settings.contact_email && (
              <a 
                href={`mailto:${settings.contact_email}`} 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={`Send us an email`}
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </a>
            )}

            {settings.social_ig && (
              <a 
                href={settings.social_ig} 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={`Visit our Instagram profile`}
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
            )}
          </div>

        </div>
      </div>
    </footer>
  )
}