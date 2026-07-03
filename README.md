# @craftthingy-digital-innovation/cty-ocr-queue

Bilingual documentation: [Bahasa Indonesia](#bahasa-indonesia) | [English](#english)

---

## Bahasa Indonesia

Library JavaScript modular isomorphic (Universal) untuk mengelola antrean pemrosesan foto OCR (Optical Character Recognition) secara berurutan (sekuensial) baik di browser maupun di server Node.js demi menghemat pemakaian memori RAM & CPU komputer client/server.

### Fitur Utama
- ⏱️ **Sequential Processing:** Mengantrekan pemrosesan gambar secara teratur (satu per satu) untuk mencegah tabrakan memory akibat pemanggilan library AI paralel.
- ⚙️ **Queue Lifecycle Status:** Melacak status pengerjaan setiap item (`pending`, `processing`, `ready`, `error`).
- 🌐 **Isomorphic & Environment Agnostic:** Bekerja mulus di Browser (menggunakan DOM Image loader) maupun di Node.js (menggunakan file paths, buffers, atau stream).

### Instalasi
```bash
npm install @craftthingy-digital-innovation/cty-ocr-queue
```

### Cara Penggunaan
```javascript
import { OcrQueueManager } from '@craftthingy-digital-innovation/cty-ocr-queue';

const ocrQueue = new OcrQueueManager({
  getOcrClient: async () => {
    // Kembalikan instansi PaddleOCRClient / Tesseract Anda
    return myOcrClientInstance;
  },
  onQueueUpdate: (queue) => {
    console.log("Antrean Terkini:", queue);
  },
  onItemReady: (item, index) => {
    console.log(`Foto ${item.filename} berhasil di-OCR!`, item.results);
  }
});

// Menambahkan gambar baru ke antrean
ocrQueue.enqueue({
  id: 'image-uuid-abc',
  filename: 'paspor_budi.jpg',
  url: 'data:image/jpeg;base64,...' // browser URL atau Node.js Buffer
});
```

---

## English

A modular isomorphic (Universal) JavaScript library to manage background OCR (Optical Character Recognition) image queues sequentially across both Browser and Node.js environments.

### Key Features
- ⏱️ **Sequential Processing:** Serializes background image analysis tasks to prevent client crashes due to parallel AI engine memory usage.
- ⚙️ **Queue Lifecycle Status:** Tracks item-level state machines (`pending`, `processing`, `ready`, `error`).
- 🌐 **Isomorphic & Environment Agnostic:** Loads DOM Images automatically in Browser environments, and supports Buffers/Streams/Paths natively in Node.js.

### Installation
```bash
npm install @craftthingy-digital-innovation/cty-ocr-queue
```

### Usage
```javascript
import { OcrQueueManager } from '@craftthingy-digital-innovation/cty-ocr-queue';

const ocrQueue = new OcrQueueManager({
  getOcrClient: async () => {
    return myPaddleOCRInstance;
  },
  onQueueUpdate: (queue) => {
    renderSidebar(queue);
  }
});

ocrQueue.enqueue({
  filename: 'doc.jpg',
  url: 'data:image/jpeg;base64,...'
});
```

## License
Licensed under Public-Source Corporate Royalty License (PSCRL). See [LICENSE](./LICENSE) for details.
