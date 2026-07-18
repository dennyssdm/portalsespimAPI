import pool from '../config/db.js';

// 1. Process Chatbot Messages & Auto-Log to DB
export const processChat = async (req, res, next) => {
  try {
    const { message, history, sessionId: reqSessionId, visitorName } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required.'
      });
    }

    const sessionId = reqSessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const resolvedIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const vName = visitorName || 'Pengunjung Portal';

    // Log incoming user message
    await pool.query(
      'INSERT INTO chatbot_logs (session_id, visitor_name, visitor_ip, sender, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, vName, resolvedIp, 'user', message, 'bot_replied']
    );

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = '';
    let isSimulated = false;
    let isUnresolved = false;

    if (!apiKey) {
      // Return simulated local response for developer convenience
      replyText = getSimulatedResponse(message);
      isSimulated = true;
      if (replyText.includes('mode simulasi') || replyText.includes('belum bisa memproses')) {
        isUnresolved = true;
      }
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      
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

      if (history && history.length > 0) {
        requestBody.contents = history.map(item => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.parts?.[0]?.text || item.message }]
        }));
      }

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
        replyText = 'Mohon maaf, terjadi gangguan koneksi ke server AI. Mohon minta bantuan operator.';
        isUnresolved = true;
      } else {
        const json = await response.json();
        replyText = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Mohon maaf, saya belum bisa memproses pesan tersebut saat ini.';
        if (replyText.includes('belum bisa memproses') || replyText.includes('maaf')) {
          isUnresolved = true;
        }
      }
    }

    const logStatus = isUnresolved ? 'unresolved' : 'bot_replied';

    // Log bot response
    await pool.query(
      'INSERT INTO chatbot_logs (session_id, visitor_name, visitor_ip, sender, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, vName, resolvedIp, 'model', replyText, logStatus]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        sessionId,
        reply: replyText,
        isSimulated,
        status: logStatus
      }
    });

  } catch (error) {
    next(error);
  }
};

// 2. Request Human Operator Handover
export const requestOperator = async (req, res, next) => {
  try {
    const { sessionId, visitorName } = req.body;

    if (!sessionId) {
      return res.status(400).json({ status: 'error', message: 'Session ID is required.' });
    }

    const vName = visitorName || 'Pengunjung Portal';

    // Update session status to unresolved/request_operator
    await pool.query(
      'UPDATE chatbot_logs SET status = ? WHERE session_id = ?',
      ['unresolved', sessionId]
    );

    // Insert system request log
    await pool.query(
      'INSERT INTO chatbot_logs (session_id, visitor_name, sender, message, status) VALUES (?, ?, ?, ?, ?)',
      [sessionId, vName, 'system', '[PERMINTAAN BANTUAN OPERATOR HUMAN]', 'unresolved']
    );

    return res.status(200).json({
      status: 'success',
      message: 'Permintaan bantuan operator telah dikirim.'
    });
  } catch (error) {
    next(error);
  }
};

// 3. Send Message from Operator
export const sendOperatorMessage = async (req, res, next) => {
  try {
    const { sessionId, message, operatorName } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ status: 'error', message: 'Session ID and message are required.' });
    }

    const opName = operatorName || 'Operator Sespim';

    // Insert operator message log
    await pool.query(
      'INSERT INTO chatbot_logs (session_id, visitor_name, sender, message, status, operator_name) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, 'Pengunjung Portal', 'operator', message, 'operator_took_over', opName]
    );

    // Update all entries for this session to operator_took_over
    await pool.query(
      'UPDATE chatbot_logs SET status = "operator_took_over", operator_name = ? WHERE session_id = ?',
      [opName, sessionId]
    );

    return res.status(200).json({ status: 'success', message: 'Pesan terkirim.' });
  } catch (error) {
    next(error);
  }
};

function getSimulatedResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('halo') || msg.includes('hai') || msg.includes('hi') || msg.includes('siang') || msg.includes('pagi')) {
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

  return "Mohon maaf, saya belum bisa memproses pesan tersebut saat ini. Mohon hubungi operator jika memerlukan bantuan lebih lanjut.";
}

// 4. Get F.A.Q & Chatbot Analytics for Dashboard
export const getChatbotStats = async (req, res, next) => {
  try {
    const [totalSessionsRow] = await pool.query('SELECT COUNT(DISTINCT session_id) as count FROM chatbot_logs');
    const [totalMessagesRow] = await pool.query('SELECT COUNT(*) as count FROM chatbot_logs');
    const [unresolvedCountRow] = await pool.query('SELECT COUNT(DISTINCT session_id) as count FROM chatbot_logs WHERE status = "unresolved"');
    const [tookOverCountRow] = await pool.query('SELECT COUNT(DISTINCT session_id) as count FROM chatbot_logs WHERE status = "operator_took_over"');

    // Recent unresolved questions (F.A.Q learning candidates)
    const [unresolvedQuestions] = await pool.query(
      `SELECT session_id, visitor_name, message, created_at 
       FROM chatbot_logs 
       WHERE sender = 'user' AND message NOT LIKE '[PERMINTAAN%'
       ORDER BY created_at DESC 
       LIMIT 15`
    );

    // Keyword topic distribution / Top Asked Questions
    const [topUserMessages] = await pool.query(
      `SELECT message, COUNT(*) as frequency 
       FROM chatbot_logs 
       WHERE sender = 'user' AND message NOT LIKE '[PERMINTAAN%'
       GROUP BY message 
       ORDER BY frequency DESC 
       LIMIT 10`
    );

    return res.status(200).json({
      status: 'success',
      data: {
        totalSessions: totalSessionsRow[0].count,
        totalMessages: totalMessagesRow[0].count,
        unresolvedCount: unresolvedCountRow[0].count,
        operatorTookOverCount: tookOverCountRow[0].count,
        unresolvedQuestions,
        topAskedQuestions: topUserMessages
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get List of Active Visitor Sessions for Live Operator Dashboard
export const getActiveSessions = async (req, res, next) => {
  try {
    const [sessions] = await pool.query(
      `SELECT 
        session_id,
        MAX(visitor_name) as visitor_name,
        MAX(visitor_ip) as visitor_ip,
        (SELECT status FROM chatbot_logs t2 WHERE t2.session_id = t1.session_id ORDER BY t2.created_at DESC LIMIT 1) as status,
        MAX(created_at) as last_activity,
        COUNT(*) as total_messages
       FROM chatbot_logs t1
       GROUP BY session_id
       ORDER BY last_activity DESC
       LIMIT 30`
    );

    return res.status(200).json({
      status: 'success',
      data: {
        sessions
      }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get Messages for a specific Session ID
export const getSessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const [messages] = await pool.query(
      'SELECT * FROM chatbot_logs WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Alias to match route definition
export const sendOperatorReply = sendOperatorMessage;

