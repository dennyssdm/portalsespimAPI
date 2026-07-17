export const processChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return simulated local response for developer convenience
      const responseText = getSimulatedResponse(message);
      return res.status(200).json({
        status: 'success',
        data: {
          reply: responseText,
          isSimulated: true
        }
      });
    }

    // Call real Google Gemini API (gemini-1.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      systemInstruction: {
        parts: [
          {
            text: "Anda adalah Agen Wira, Virtual Assistant resmi Sespim Lemdiklat Polri. Tugas Anda adalah membantu menjawab pertanyaan seputar Sespim Lemdiklat Polri, seperti program Sespimti, Sespimmen, Sespimma, profil pimpinan dan Widyaiswara, materi terbuka, lokasi (Lembang, Bandung Barat), sejarah, serta inpassing widyaiswara. Gunakan gaya bahasa kepolisian yang sopan, formal, profesional, dan menggunakan istilah seperti 'Siap', 'Mohon izin', 'Terima kasih'."
          }
        ]
      },
      contents: []
    };

    // Map history to Gemini API format if present
    if (history && history.length > 0) {
      requestBody.contents = history.map(item => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.parts?.[0]?.text || item.message }]
      }));
    }

    // Append new message
    requestBody.contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned error: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    const replyText = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Mohon maaf, saya belum bisa memproses pesan tersebut saat ini.';

    return res.status(200).json({
      status: 'success',
      data: {
        reply: replyText,
        isSimulated: false
      }
    });

  } catch (error) {
    next(error);
  }
};

function getSimulatedResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('siapa kamu') || msg.includes('nama kamu') || msg.includes('wira')) {
    return "Siap, nama saya adalah Agen Wira, Virtual Assistant resmi Sespim Lemdiklat Polri. Ada yang bisa saya bantu terkait program pendidikan atau informasi umum Sespim?";
  }

  if (msg.includes('sespimmen') || msg.includes('sespimti') || msg.includes('sespimma') || msg.includes('program')) {
    return "Siap, Sespim Lemdiklat Polri menyelenggarakan tiga jenjang pendidikan kepemimpinan:\n1. **Sespimti** (Sekolah Staf dan Pimpinan Tinggi) untuk Perwira Tinggi/Menengah senior.\n2. **Sespimmen** (Sekolah Staf dan Pimpinan Menengah) untuk Perwira Menengah.\n3. **Sespimma** (Sekolah Staf dan Pimpinan Pertama) untuk Perwira Pertama.\n\nMasing-masing program dirancang untuk membentuk kepemimpinan Polri yang presisi dan berintegritas.";
  }

  if (msg.includes('inpassing') || msg.includes('sertifikat') || msg.includes('klaim')) {
    return "Siap, untuk menyelesaikan Inpassing Widyaiswara, Anda dapat masuk ke Dashboard Internal Widyaiswara, mengakses menu **Klaim Sertifikat Inpassing**, lalu mengeklik tombol **Klaim Sertifikat**. Setelah berhasil diklaim, status sertifikat Anda akan otomatis terintegrasi ke dalam direktori profil publik.";
  }

  if (msg.includes('alamat') || msg.includes('lokasi') || msg.includes('di mana') || msg.includes('lembang')) {
    return "Siap, Kampus Sespim Lemdiklat Polri berlokasi di **Jl. Maribaya No.53, Kayuambon, Kec. Lembang, Kabupaten Bandung Barat, Jawa Barat 40391**.";
  }

  if (msg.includes('pimpinan') || msg.includes('kasespim') || msg.includes('kepala')) {
    return "Siap, Kepala Sespim Lemdiklat Polri saat ini adalah **Irjen Pol. Midi Siswoko, S.I.K.** yang memimpin seluruh program pembinaan dan pendidikan kepemimpinan kepolisian.";
  }

  if (msg.includes('terima kasih') || msg.includes('thanks') || msg.includes('suwun')) {
    return "Siap, sama-sama. Senang bisa membantu Anda. Jika ada hal lain yang perlu ditanyakan seputar Sespim, saya siap menjawab. Terima kasih!";
  }

  // Default response
  return `Siap, terima kasih atas pertanyaannya: "${message}". 

Saat ini saya berjalan dalam *mode simulasi pengujian* karena kunci akses API belum diaktifkan di server. 

Untuk mengaktifkan jawaban kecerdasan buatan dinamis yang lengkap, mohon minta administrator untuk menambahkan kunci \`GEMINI_API_KEY\` pada berkas konfigurasi \`.env\` di server API.`;
}
