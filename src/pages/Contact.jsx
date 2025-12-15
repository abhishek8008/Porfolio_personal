import { Mail, Phone, Github, Linkedin, MapPin, Rocket, Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from "./Contact.module.css";
import { publicAPI } from "../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicAPI.getProfile();
        if (response.success && response.profile) {
          setProfile(response.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Default values if profile not loaded
  const contactEmail = profile?.email || 'akr393456@gmail.com';
  const contactPhone = profile?.phone || '+91-9535563061';
  const contactLocation = profile?.location || 'Bengaluru, Karnataka, India';
  const githubUrl = profile?.github || 'https://github.com/abhishek8008';
  const linkedinUrl = profile?.linkedin || 'https://linkedin.com/in/abhishek-kumar-r';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await publicAPI.submitContact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Contact Form Submission',
        message: formData.message
      });

      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Message sent successfully! I will get back to you soon.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
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
                <a href={`mailto:${contactEmail}`} className={`${styles.contactItem} flex items-center gap-4`}>
                  <div className={styles.iconPlanet}>
                    <Mail className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider">Email Transmission</p>
                    <p className="font-space text-white">{contactEmail}</p>
                  </div>
                </a>

                <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`} className={`${styles.contactItem} flex items-center gap-4`}>
                  <div className={styles.iconPlanet}>
                    <Phone className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider">Direct Line</p>
                    <p className="font-space text-white">{contactPhone}</p>
                  </div>
                </a>

                <div className={`${styles.contactItem} flex items-center gap-4`}>
                  <div className={styles.iconPlanet}>
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm text-white/50 uppercase tracking-wider">Base Station</p>
                    <p className="font-space text-white">{contactLocation}</p>
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
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialPlanet}
                  >
                    <Github className="w-6 h-6 text-white/70 hover:text-orange-400 transition-colors" />
                  </a>
                  <a
                    href={linkedinUrl}
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
              <div className={styles.formCard}>
                {/* Status Message */}
                {submitStatus.message && (
                  <div className={`${styles.statusMessage} ${submitStatus.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{submitStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        <span className={styles.labelIcon}>01</span>
                        Callsign
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={styles.formInput}
                        placeholder="Your name..."
                      />
                      <div className={styles.inputGlow} />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        <span className={styles.labelIcon}>02</span>
                        Frequency
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={styles.formInput}
                        placeholder="your@email.com"
                      />
                      <div className={styles.inputGlow} />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span className={styles.labelIcon}>03</span>
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={styles.formInput}
                      placeholder="What's this about?"
                    />
                    <div className={styles.inputGlow} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <span className={styles.labelIcon}>04</span>
                      Message Payload
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder="Your message to the cosmos..."
                    />
                    <div className={styles.inputGlow} />
                  </div>

                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Launch Message
                      </>
                    )}
                    <div className={styles.buttonGlow} />
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