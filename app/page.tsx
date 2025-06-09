"use client";
import Navbar from "@/components/layout/navbar/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Gradient from "@/components/ui/gradient";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import useAddMailToWaitingList from "@/hooks/useAddMailToWaitingList";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@radix-ui/react-label";
import {
  BarChart3,
  Brain,
  Clock,
  Mail,
  MessageSquare,
  Mic,
  Settings,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { loading, isLoggedIn } = useAuth(null as never);
    const {handleAddMailToWaitlist, email, setEmail, isEmailValid, isValidEmail} = useAddMailToWaitingList();

  if (isLoggedIn) router.push("/dashboard");
  if (loading) return <Loader />;

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <Navbar />
      </div>{" "}
      <Gradient />
      {/* Huvudsektion */}
      <section className="flex relative justify-center items-center h-[calc(100vh-250px)] text-center">
        <div className="max-w-[1000px] text-white flex flex-col md:gap-6 gap-4 ">
          <h1 className="md:text-8xl text-[35px] text-white font-light ">
            Från <span className="text-primary">samtal</span> till insikt på
            några <span className="text-secondary">sekunder.</span>
          </h1>
          <p className="md:text-xl text-sm text-white max-w-xl text-center mx-auto">
            Quickfeed analyserar varje säljsamtal automatiskt och visar exakt
            vad som funkar – innan du tappar nästa kund.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/sign-up"
              className="bg-[#E0B9E0] py-3 px-6 text-black text-md hover:bg-[#E0B9E0]/80 transition-colors rounded-full"
            >
              Starta testperiod
            </Link>
            <button className="border border-[#E0B9E0] md:py-3 md:px-6 md:text-base text-sm py-1 px-4 text-white hover:bg-[#E0B9E0] transition-colors rounded-full hover:text-black">
              Boka demo
            </button>
          </div>
        </div>
      </section>
      {/* Funktionssektion */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Allt du behöver för att växa ditt
              <span className="block bg-gradient-to-r from-[#BCCCE4] to-[#E0B9E0] bg-clip-text text-transparent">
                  säljteam
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Omfattande AI-coachningsverktyg designade för moderna säljteam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-white/10 hover:border-[#BCCCE4]/50 transition-all duration-300 backdrop-blur-sm group hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-[#BCCCE4]/20 to-[#E0B9E0]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-7 h-7 text-[#BCCCE4]" />
                </div>
                <CardTitle className="text-xl text-white">
                  Direktsammanalys
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Ladda upp dina säljsamtal och få detaljerad AI-feedback på
                  några minuter. Upptäck vad som fungerade och vad som inte gjorde det.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 border-white/10 hover:border-[#E0B9E0]/50 transition-all duration-300 backdrop-blur-sm group hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-[#E0B9E0]/20 to-[#BCCCE4]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-7 h-7 text-[#E0B9E0]" />
                </div>
                <CardTitle className="text-xl text-white">
                  Interaktiv AI-coachning
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Chatta med AI om specifika stunder i dina samtal. Fråga "Varför
                  invände de?" och få expertinsikter.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 border-white/10 hover:border-[#BCCCE4]/50 transition-all duration-300 backdrop-blur-sm group hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-[#BCCCE4]/20 to-[#E0B9E0]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-[#BCCCE4]" />
                </div>
                <CardTitle className="text-xl text-white">
                  Teamprestandapanel
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Få en tydlig översikt över teamets och individers prestanda. Spåra
                  framsteg och identifiera coachningsprioriteringar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 border-white/10 hover:border-[#E0B9E0]/50 transition-all duration-300 backdrop-blur-sm group hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-[#E0B9E0]/20 to-[#BCCCE4]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-7 h-7 text-[#E0B9E0]" />
                </div>
                <CardTitle className="text-xl text-white">
                  Veckans bästa samtal
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Fira excellens med veckans höjdpunkter. Dela framgångsrika
                  exempel med hela ditt team.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 border-white/10 hover:border-[#BCCCE4]/50 transition-all duration-300 backdrop-blur-sm group hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-[#BCCCE4]/20 to-[#E0B9E0]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-7 h-7 text-[#BCCCE4]" />
                </div>
                <CardTitle className="text-xl text-white">
                  Anpassade playbooks
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Anpassa AI-feedback baserat på din säljmetodik. Skapa
                  anpassade uppmaningar för din process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 border-white/10 hover:border-[#E0B9E0]/50 transition-all duration-300 backdrop-blur-sm group hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-[#E0B9E0]/20 to-[#BCCCE4]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-[#E0B9E0]" />
                </div>
                <CardTitle className="text-xl text-white">
                  Teamhantering
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Hantera enkelt team, lägg till eller ta bort medlemmar, och organisera
                  coachningsprogram i stor skala.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* Hur det fungerar-sektion */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Enkel 3-stegsprocess
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Förvandla din säljcoachning på några minuter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-[#BCCCE4] to-[#E0B9E0] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-black">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Ladda upp dina samtal
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Ladda helt enkelt upp dina inspelade säljsamtal till vår säkra plattform.
                Vi stöder alla större filformat.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-[#E0B9E0] to-[#BCCCE4] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-black">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Få AI-analys
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Vår AI analyserar ditt samtal på några minuter, identifierar nyckelögonblick,
                invändningar och möjligheter till förbättring.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-[#BCCCE4] to-[#E0B9E0] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-black">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Förbättra & coacha
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Få åtgärdsbar feedback och coachningsförslag. Chatta med
                AI för djupare insikter om specifika stunder.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Nyhetsbrevssektion */}
<div className="py-32 max-w-7xl mx-auto">
      <form onSubmit={handleAddMailToWaitlist} className="space-y-6">
        <input
          type="text"
          className="md:text-5xl text-3xl active:border-none w-full bg-transparent focus:outline-none focus:border-none "
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="py-3 px-8 font-normal rounded-full text-black hover:opacity-80 bg-primary md:text-lg text-sm">
          Join the waitlist
        </button>
      </form>
    </div>



      {/* Socialt bevis-sektion */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8">
              Används av säljteam över hela världen
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-8">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-[#E0B9E0] fill-current"
                  />
                ))}
              </div>
              <span className="text-gray-300 ml-2 text-lg">
                4.9/5 från 500+ säljteam
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-[#BCCCE4]/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-[#E0B9E0] fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 text-lg">
                  "SalesCoach AI förvandlade vårt teams prestanda. Vi har sett
                  en 40% ökning av vår försäljningsgrad sedan implementeringen."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#BCCCE4]/30 to-[#E0B9E0]/30 rounded-full flex items-center justify-center mr-4">
                    <span className="text-[#BCCCE4] font-semibold">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Sarah Johnson</p>
                    <p className="text-sm text-gray-400">
                      VP of Sales, TechFlow
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-[#E0B9E0]/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-[#E0B9E0] fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 text-lg">
                  "AI-coachningen är som att ha en säljexpert som analyserar varje
                  samtal. Mitt teams självförtroende har skjutit i höjden."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#E0B9E0]/30 to-[#BCCCE4]/30 rounded-full flex items-center justify-center mr-4">
                    <span className="text-[#E0B9E0] font-semibold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Mike Rodriguez</p>
                    <p className="text-sm text-gray-400">
                      Sales Director, GrowthLabs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-[#BCCCE4]/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-[#E0B9E0] fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 text-lg">
                  "Äntligen ett verktyg som ger mig verkliga insikter om mina samtal.
                  Jag har förbättrat min hantering av invändningar dramatiskt."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#BCCCE4]/30 to-[#E0B9E0]/30 rounded-full flex items-center justify-center mr-4">
                    <span className="text-[#BCCCE4] font-semibold">AC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Alex Chen</p>
                    <p className="text-sm text-gray-400">
                      Senior SDR, SalesForce Pro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Kontaktformulär-sektion */}
      <section id="contact-form" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#BCCCE4]/10 to-[#E0B9E0]/10 backdrop-blur-sm"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
              Redo att transformera ditt
              <span className="block bg-gradient-to-r from-[#BCCCE4] to-[#E0B9E0] bg-clip-text text-transparent">
                säljteam?
              </span>
            </h2>
            <p className="text-xl mb-12 text-gray-300">
              Fyll i formuläret så kontaktar vi dig inom 24 timmar
            </p>
          </div>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Namn *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      className="bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:border-[#BCCCE4]/50"
                      placeholder="Ditt fullständiga namn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      E-post *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className="bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:border-[#BCCCE4]/50"
                      placeholder="din@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Telefonnummer *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      className="bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:border-[#BCCCE4]/50"
                      placeholder="+46 70 123 45 67"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white">
                      Företag *
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      required
                      className="bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:border-[#BCCCE4]/50"
                      placeholder="Ditt företagsnamn"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    Meddelande (valfritt)
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    className="bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:border-[#BCCCE4]/50"
                    placeholder="Berätta gärna mer om dina behov..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#BCCCE4] to-[#E0B9E0] hover:from-[#BCCCE4]/90 hover:to-[#E0B9E0]/90 text-black text-lg py-6 font-bold transform hover:scale-105 transition-all duration-200"
                >
                  Skicka förfrågan
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-[#BCCCE4]" />
              Säkerhet på företagsnivå
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#E0B9E0]" />
              Konfiguration under 5 minuter
            </div>
          </div>
        </div>
      </section>
            {/* Sidfot */}
      <footer className="bg-black/60 backdrop-blur-sm border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-[#BCCCE4] to-[#E0B9E0] rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">SalesCoach AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transformerar säljteam med AI-driven coaching och analys.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Produkt</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">Funktioner</a></li>
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">Integrationer</a></li>
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Företag</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#E0B9E0] transition-colors">Om oss</a></li>
                <li><a href="#" className="hover:text-[#E0B9E0] transition-colors">Blogg</a></li>
                <li><a href="#" className="hover:text-[#E0B9E0] transition-colors">Karriär</a></li>
                <li><a href="#" className="hover:text-[#E0B9E0] transition-colors">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">Hjälpcenter</a></li>
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">Dokumentation</a></li>
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">Integritet</a></li>
                <li><a href="#" className="hover:text-[#BCCCE4] transition-colors">Villkor</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SalesCoach AI. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}