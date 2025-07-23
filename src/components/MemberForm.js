import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import emailjs from '@emailjs/browser';
import styles from '../styles/Form.module.css';

export default function MemberForm({ onFormSubmit }) {
  const { addMember } = useAppContext();
  const [member, setMember] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember(prev => ({ ...prev, [name]: value }));
  };

  const sendWelcomeEmail = (newMember) => {
    // Ganti dengan Service ID, Template ID, dan Public Key Anda dari EmailJS
    const serviceID = 'service_iwb7oi7';
    const templateID = 'template_rs2dbf8';
    const publicKey = 'GQZtAAGesoeEnDW_Z';

    const templateParams = {
        nama: newMember.name,
        email: newMember.email,
    };
    
    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
         console.log('Email berhasil terkirim!', response.status, response.text);
      }, (err) => {
         console.error('Gagal mengirim email.', err);
         alert("Member berhasil didaftarkan, namun notifikasi email gagal dikirim.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newMember = addMember(member);
    
    // Kirim email jika email diisi
    if (member.email) {
      sendWelcomeEmail(newMember);
    }
    
    alert(`Member ${member.name} berhasil didaftarkan!`);
    setMember({ name: '', phone: '', email: '' });
    setIsSubmitting(false);

    if (onFormSubmit) {
      onFormSubmit(newMember);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="name" value={member.name} onChange={handleChange} placeholder="Nama Lengkap" required />
      <input name="phone" type="tel" value={member.phone} onChange={handleChange} placeholder="Nomor HP" required />
      <input name="email" type="email" value={member.email} onChange={handleChange} placeholder="Email (Opsional)" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Member'}
      </button>
    </form>
  );
}