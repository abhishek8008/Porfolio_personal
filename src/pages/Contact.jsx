import { Mail, Phone, Github, Linkedin, MapPin, Rocket, Star } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import styles from "./Contact.module.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const mailtoLink = `mailto:akr393456@gmail.com?subject=Portfolio Contact from ${
      formData.name
    }&body=${encodeURIComponent(
      formData.message + "\n\nFrom: " + formData.email
    )}`;

    window.location.href = mailtoLink;
  };

  return (
    <div className={styles.contactPage}>
      {/* Cosmic Background */}
      <div className={styles.cosmicStars} />
      <div className={`${styles.nebulaGlow} ${styles.nebula1}`} />
      <div className={`${styles.nebulaGlow} ${styles.nebula2}`} />
      <div className={`${styles.nebulaGlow} ${styles.nebula3}`} />
      <div className={styles.shootingStar} />
      <div className={styles.shootingStar} />

      {/* Floating Planets */}
      <div className={`${styles.floatingPlanet} ${styles.planet1}`} />
      <div className={`${styles.floatingPlanet} ${styles.planet2}`} />
      <div className={`${styles.floatingPlanet} ${styles.planet3}`} />

      <Navbar />

      {/* Centered Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className="text-center mb-16">
            <div
              className={`flex items-center justify-center gap-3 mb-4 ${styles.fadeUp}`}
              style={{ animationDelay: "0.1s" }}
            >
              <Star className="w-5 h-5 text-orange-400" />
              <p className="font-rajdhani text-orange-400 text-lg tracking-[0.3em] uppercase">
                Get In Touch
              </p>
              <Star className="w-5 h-5 text-orange-400" />
            </div>
            <h1
              className={`font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${styles.fadeUp}`}
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-white">Launch Your </span>
              <span className={styles.solarTitle}>Message</span>
            </h1>
        
          </div>

          {/* Grid – contact info left, form far right */}
          <div className="h-8 md:h-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 justify-between items-start">
            {/* Contact Info */}
            <div className={styles.fadeUp} style={{ animationDelay: "0.4s" }}>
              <h2 className="font-orbitron text-2xl font-bold text-white mb-9 justify-center items-center flex gap-3">
                Establish <span className={styles.solarTitle}>Connection</span>
              </h2>
<div className="h-8 md:h-2" />
              <div className="space-y-5">
                <a href="mailto:akr393456@gmail.com" className={`${styles.contactItem} flex items-center gap-4`}>
                  <div className={styles.iconPlanet}>
                    <Mail className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider">Email Transmission</p>
                    <p className="font-space text-white">akr393456@gmail.com</p>
                  </div>
                </a>

                <a href="tel:+919535563061" className={`${styles.contactItem} flex items-center gap-4`}>
                  <div className={styles.iconPlanet}>
                    <Phone className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider">Direct Line</p>
                    <p className="font-space text-white">+91-9535563061</p>
                  </div>
                </a>

                <div className={`${styles.contactItem} flex items-center gap-4`}>
                  <div className={styles.iconPlanet}>
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider">Base Station</p>
                    <p className="font-space text-white">Bengaluru, Karnataka, India</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="h-8 md:h-6" />
              <div className="mt-10">
                <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider mb-5 justify-center items-center flex gap-3">
                  Satellite Links
                </p>
                 <div className="h-8 md:h-2" />
                <div className="flex gap-5 justify-center items-center">
                  <a
                    href="https://github.com/abhishek8008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialPlanet}
                  >
                    <Github className="w-6 h-6 text-white/70 hover:text-orange-400 transition-colors" />
                  </a>
                  <a
                    href="https://linkedin.com/in/abhishek-kumar-r"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialPlanet}
                  >
                    <Linkedin className="w-6 h-6 text-white/70 hover:text-orange-400 transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form - Far Right */}
          
              
            <div className={`${styles.fadeUp} lg:justify-self-end`} style={{ animationDelay: "0.5s" }}>
              
               <div className="flex items-center gap-3 mb-6 justify-center items-center">
                  <Rocket className="w-6 h-6 text-orange-400" />
                  <h3 className="font-orbitron text-xl font-bold text-white">Send Transmission</h3>
                </div>
                 <div className="h-8 md:h-2" />
              <div className={`${styles.cosmicCard} p-8 lg:min-w-[520px] lg:w-[550px]`}>
               

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  
                  <div>
                     <div className="h-8 md:h-2" />
                    <label className="font-rajdhani text-sm text-white/50 uppercase tracking-wider mb-2 block ml-1">
                      Callsign
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={styles.cosmicInput}
                      placeholder="Your name..."
                    />
                  </div>

                  <div>
                    <label className="font-rajdhani text-sm text-white/50 uppercase tracking-wider mb-2 block ml-1">
                      Communication Frequency
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className={styles.cosmicInput}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="font-rajdhani text-sm text-white/50 uppercase tracking-wider mb-2 block ml-1">
                      Message Payload
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className={`${styles.cosmicInput} resize-none`}
                      placeholder="Your message to the cosmos..."
                    />
                  </div>

                  <button type="submit" className={styles.launchButton}>
                    <Rocket className="w-5 h-5" />
                    Launch Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;