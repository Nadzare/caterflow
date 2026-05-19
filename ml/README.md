# CaterFlow Machine Learning (LSTM Model)

Folder ini berisi skrip Python untuk melatih model Deep Learning **LSTM (Long Short-Term Memory)** guna memprediksi tren pesanan katering wholesale harian.

## 🛠️ Prasyarat Instalasi

Pastikan Anda sudah menginstal **Python (versi 3.8 ke atas)** di laptop Anda. 

Sebelum menjalankan skrip training, instal pustaka Python yang dibutuhkan dengan menjalankan perintah berikut di terminal Anda:

```bash
pip install numpy pandas requests scikit-learn tensorflow matplotlib
```

## 🚀 Cara Menjalankan Training

1. Pastikan dev server Next.js Anda sedang berjalan secara lokal:
   ```bash
   npm run dev
   ```
   *(API harus dapat diakses di http://localhost:3000/api/ml-dataset)*

2. Buka terminal baru, masuk ke folder `ml/` ini, lalu jalankan skrip Python:
   ```bash
   python train_lstm.py
   ```

## 📊 Hasil Output

* **Output Konsol:** Menampilkan struktur matriks data input, ringkasan arsitektur jaringan saraf LSTM, dan proses pelatihan epoch-by-epoch.
* **lstm_loss_plot.png:** Grafik performa loss (Mean Squared Error) selama proses pelatihan untuk mengevaluasi apakah model mengalami *underfitting* atau *overfitting*.
