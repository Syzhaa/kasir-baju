import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import emailjs from '@emailjs/browser';
import styles from '../styles/Form.module.css';

const initialMember = { name: '', phone: '', email: '', discount: '10' };

export default function MemberForm({ memberToEdit, onFormSubmit }) {
  const { addMember, updateMember } = useAppContext();
  const [member, setMember] = useState(initialMember);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setMember(memberToEdit);
    } else {
      setMember(initialMember);
    }
  }, [memberToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember(prev => ({ ...prev, [name]: value }));
  };

  const sendWelcomeEmail = (newMemberData) => {
    // Kredensial EmailJS Anda sudah dimasukkan di sini
    const serviceID = 'service_da7c38e';
    const templateID = 'template_rs2dbf8';
    const publicKey = 'GQZtAAGesoeEnDW_Z';

    // Pastikan key di sini (cth: 'nama', 'email') SAMA PERSIS
    // dengan variabel di template EmailJS Anda (cth: {{nama}}, {{email}})
    const templateParams = {
        nama: newMemberData.name,
        email: newMemberData.email,
    };
    
    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
         console.log('Email berhasil terkirim!', response.status, response.text);
         alert("Member berhasil didaftarkan! Email notifikasi telah dikirim.");
      }, (err) => {
         console.error('GAGAL MENGIRIM EMAIL:', err);
         alert("Member berhasil didaftarkan, NAMUN notifikasi email GAGAL dikirim. Cek console browser untuk detail error.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (memberToEdit) {
      updateMember(member);
      alert(`Data member ${member.name} berhasil diupdate!`);
      setIsSubmitting(false);
      if (onFormSubmit) onFormSubmit();
    } else {
      const newMember = addMember(member);
      
      if (member.email) {
        sendWelcomeEmail(newMember);
      } else {
        alert(`Member ${member.name} berhasil didaftarkan!`);
      }
      
      // Reset form setelah proses selesai
      setMember(initialMember);
      setIsSubmitting(false);
      if (onFormSubmit) onFormSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="name" value={member.name} onChange={handleChange} placeholder="Nama Lengkap" required />
      <input name="phone" type="tel" value={member.phone} onChange={handleChange} placeholder="Nomor HP" required />
      <input name="email" type="email" value={member.email} onChange={handleChange} placeholder="Email (Opsional)" />
      
      <div className={styles.formGroup}>
        <label htmlFor="discount">Diskon Member (%)</label>
        <input 
          id="discount"
          name="discount" 
          type="number" 
          value={member.discount} 
          onChange={handleChange} 
          placeholder="Contoh: 10" 
          min="0"
          max="100"
          required 
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : (memberToEdit ? 'Update Member' : 'Daftarkan Member')}
      </button>
    </form>
  );
}