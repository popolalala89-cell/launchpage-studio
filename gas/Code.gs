/**
 * LaunchPage Studio — Google Apps Script Backend
 *
 * Fungsi:
 * 1. doGet() / doPost() — API endpoint untuk form order & kontak
 * 2. saveOrder() — Simpan data order ke Google Sheets
 * 3. sendNotifications() — Email notifikasi ke admin & konfirmasi ke customer
 * 4. getOrders() — API untuk dashboard pelanggan (V2)
 */

// ============================================================
// KONFIGURASI
// ============================================================
var CONFIG = {
  // Ganti dengan ID spreadsheet kamu
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  // Nama sheet
  SHEET_ORDERS: 'Orders',
  SHEET_CONTACTS: 'Contacts',
  SHEET_LOG: 'Log',
  // Email admin untuk notifikasi
  ADMIN_EMAIL: 'admin@launchpage-studio.com',
  // URL frontend (untuk CORS & redirect)
  FRONTEND_URL: 'https://launchpage-studio.com',
};

// ============================================================
// HANDLER UTAMA — doGet & doPost
// ============================================================

function doGet(e) {
  return handleCORS(function() {
    var action = e.parameter.action || '';

    switch (action) {
      case 'getOrders':
        var orderId = e.parameter.orderId || '';
        return getOrders(orderId);
      case 'getOrderByEmail':
        var email = e.parameter.email || '';
        return getOrdersByEmail(email);
      case 'checkStatus':
        return getOrderStatus(e.parameter.orderId || '');
      default:
        return sendJson({ status: 'ok', message: 'LaunchPage Studio API is running.', version: '1.0' });
    }
  });
}

function doPost(e) {
  return handleCORS(function() {
    try {
      var data;
      if (e && e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else {
        return sendJson({ status: 'error', message: 'No data received.' }, 400);
      }

      var action = data.action || '';

      switch (action) {
        case 'submitOrder':
          return saveOrder(data);
        case 'contact':
          return saveContact(data);
        case 'updateOrder':
          return updateOrder(data);
        default:
          return sendJson({ status: 'error', message: 'Unknown action: ' + action }, 400);
      }
    } catch (err) {
      return sendJson({ status: 'error', message: 'Server error: ' + err.toString() }, 500);
    }
  });
}

// ============================================================
// CORS HANDLER
// ============================================================

function handleCORS(callback) {
  try {
    var result = callback();
    // Add CORS headers
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify(result.content));

    // Return with CORS headers via HtmlService workaround
    return output;
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendJson(data, statusCode) {
  return {
    content: data,
    statusCode: statusCode || 200
  };
}

// ============================================================
// FUNGSI UTAMA — ORDER
// ============================================================

function saveOrder(data) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_ORDERS);

  // Generate Order ID
  var orderId = 'LPS-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd') + '-' +
                String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

  var timestamp = new Date();
  var rowData = [
    orderId,
    timestamp,
    data.name || '',
    data.phone || '',
    data.email || '',
    data.businessName || '',
    data.businessType || '',
    data.package || '',          // Basic / Pro / Premium
    data.description || '',
    data.logoUrl || '',
    data.colors || '',
    data.reference || '',
    'pending',                   // Status: pending, processing, revision, done, completed
    '',                          // Admin notes
    '',                          // Payment status
    '',                          // Payment amount
    '',                          // Payment date
    new Date()                   // Last update
  ];

  // Check if headers exist, if not add them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'OrderID', 'Timestamp', 'Nama', 'No. HP', 'Email',
      'Nama Bisnis', 'Tipe Bisnis', 'Paket', 'Deskripsi',
      'URL Logo', 'Warna Brand', 'Referensi Demo', 'Status',
      'Catatan Admin', 'Status Pembayaran', 'Jumlah Bayar', 'Tanggal Bayar', 'Last Update'
    ]);
  }

  sheet.appendRow(rowData);

  // Kirim notifikasi email
  sendEmailNotification(orderId, data);

  // Log
  logActivity('Order', orderId, 'Order baru dibuat: ' + orderId + ' - ' + data.package);

  return sendJson({
    status: 'success',
    message: 'Pesanan berhasil dibuat! Kami akan menghubungi Anda segera.',
    orderId: orderId,
    data: {
      orderId: orderId,
      name: data.name,
      package: data.package,
      status: 'pending',
      timestamp: timestamp
    }
  });
}

function saveContact(data) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_CONTACTS);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Nama', 'No. HP', 'Email', 'Pesan', 'Source']);
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.phone || '',
    data.email || '',
    data.message || '',
    data.source || 'website'
  ]);

  return sendJson({
    status: 'success',
    message: 'Pesan berhasil dikirim! Kami akan membalas segera.'
  });
}

// ============================================================
// DASHBOARD — GET ORDER
// ============================================================

function getOrders(orderId) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);

  if (!sheet || sheet.getLastRow() < 2) {
    return sendJson({ status: 'success', orders: [] });
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var orders = [];

  for (var i = 1; i < data.length; i++) {
    if (orderId && data[i][0] !== orderId) continue;
    if (data[i][0] === '') continue;

    var order = {};
    for (var j = 0; j < headers.length; j++) {
      order[headers[j]] = data[i][j];
    }
    orders.push(order);
    if (orderId) break;
  }

  return sendJson({ status: 'success', orders: orders });
}

function getOrdersByEmail(email) {
  if (!email) return sendJson({ status: 'error', message: 'Email diperlukan.' }, 400);

  var result = getOrders('');
  if (result.statusCode >= 400) return result;

  var filtered = result.content.orders.filter(function(o) {
    return o.Email && o.Email.toLowerCase() === email.toLowerCase();
  });

  return sendJson({ status: 'success', orders: filtered });
}

function getOrderStatus(orderId) {
  if (!orderId) return sendJson({ status: 'error', message: 'OrderID diperlukan.' }, 400);

  var result = getOrders(orderId);
  if (result.statusCode >= 400) return result;

  if (result.content.orders.length === 0) {
    return sendJson({ status: 'error', message: 'Order tidak ditemukan.' }, 404);
  }

  var order = result.content.orders[0];
  return sendJson({
    status: 'success',
    orderId: order.OrderID,
    name: order.Nama,
    businessName: order['Nama Bisnis'],
    package: order.Paket,
    orderStatus: order.Status,
    paymentStatus: order['Status Pembayaran'],
    timestamp: order.Timestamp
  });
}

// ============================================================
// ADMIN — UPDATE ORDER
// ============================================================

function updateOrder(data) {
  // Simple auth check
  var adminKey = data.adminKey || '';
  if (adminKey !== 'YOUR_ADMIN_SECRET_KEY') {
    return sendJson({ status: 'error', message: 'Unauthorized.' }, 403);
  }

  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!sheet) return sendJson({ status: 'error', message: 'Sheet not found.' }, 404);

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var orderIdCol = 0; // OrderID is column A

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][orderIdCol] === data.orderId) {
      var rowNum = i + 1;
      var statusCol = headers.indexOf('Status') + 1;
      var notesCol = headers.indexOf('Catatan Admin') + 1;
      var payStatusCol = headers.indexOf('Status Pembayaran') + 1;
      var lastUpdateCol = headers.indexOf('Last Update') + 1;

      if (data.newStatus && statusCol > 0) {
        sheet.getRange(rowNum, statusCol).setValue(data.newStatus);
      }
      if (data.notes && notesCol > 0) {
        sheet.getRange(rowNum, notesCol).setValue(data.notes);
      }
      if (data.paymentStatus && payStatusCol > 0) {
        sheet.getRange(rowNum, payStatusCol).setValue(data.paymentStatus);
      }
      if (lastUpdateCol > 0) {
        sheet.getRange(rowNum, lastUpdateCol).setValue(new Date());
      }

      logActivity('Update', data.orderId, 'Order diupdate: ' + data.orderId);

      return sendJson({ status: 'success', message: 'Order berhasil diupdate.' });
    }
  }

  return sendJson({ status: 'error', message: 'Order tidak ditemukan.' }, 404);
}

// ============================================================
// NOTIFIKASI EMAIL
// ============================================================

function sendEmailNotification(orderId, data) {
  try {
    // Email ke admin
    var adminBody = [
      'Order Baru Diterima!',
      '',
      'Order ID: ' + orderId,
      'Nama: ' + (data.name || '-'),
      'No. HP: ' + (data.phone || '-'),
      'Email: ' + (data.email || '-'),
      'Nama Bisnis: ' + (data.businessName || '-'),
      'Tipe Bisnis: ' + (data.businessType || '-'),
      'Paket: ' + (data.package || '-'),
      'Deskripsi: ' + (data.description || '-'),
      '',
      'Cek spreadsheet untuk detail lengkap.',
      'https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID
    ].join('\n');

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: '[LaunchPage Studio] Order Baru - ' + orderId,
      body: adminBody
    });

    // Email konfirmasi ke customer (jika email diisi)
    if (data.email) {
      var customerBody = [
        'Halo ' + (data.name || 'Kakak') + ',',
        '',
        'Terima kasih sudah memesan di LaunchPage Studio!',
        '',
        'Berikut detail pesanan Anda:',
        'Order ID: ' + orderId,
        'Paket: ' + (data.package || '-'),
        '',
        'Tim kami akan menghubungi Anda dalam 1x24 jam melalui WhatsApp.',
        '',
        'Gunakan Order ID di atas untuk cek status pesanan di dashboard.',
        '',
        'Salam,
        LaunchPage Studio',
        'https://launchpage-studio.com'
      ].join('\n');

      MailApp.sendEmail({
        to: data.email,
        subject: '[LaunchPage Studio] Konfirmasi Pesanan - ' + orderId,
        body: customerBody
      });
    }
  } catch (err) {
    logActivity('Error', orderId, 'Gagal kirim email: ' + err.toString());
  }
}

// ============================================================
// FUNGSI BANTU
// ============================================================

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function logActivity(type, ref, message) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = getOrCreateSheet(ss, CONFIG.SHEET_LOG);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Type', 'Reference', 'Message']);
    }

    sheet.appendRow([new Date(), type, ref, message]);
  } catch (e) {
    // Silent fail — logging tidak boleh mengganggu fungsi utama
  }
}

// ============================================================
// TEST FUNCTION (jalankan di editor GAS untuk test)
// ============================================================

function testSaveOrder() {
  var testData = {
    action: 'submitOrder',
    name: 'Test User',
    phone: '08123456789',
    email: 'test@example.com',
    businessName: 'Toko Test',
    businessType: 'UMKM',
    package: 'Pro',
    description: 'Mau landing page untuk toko online.',
    logoUrl: '',
    colors: 'Biru, Putih',
    reference: 'restoran'
  };
  var result = saveOrder(testData);
  Logger.log(JSON.stringify(result));
}

function testGetOrders() {
  var result = getOrders('');
  Logger.log(JSON.stringify(result));
}
