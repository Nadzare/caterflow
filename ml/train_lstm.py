import numpy as np
import pandas as pd
import requests
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def train_lstm_model():
    # 1. Ambil dataset dari API Next.js CaterFlow Anda
    # Ganti localhost dengan domain Vercel jika sudah dideploy ke cloud
    url = "http://localhost:3000/api/ml-dataset"
    print(f"Mengambil data dari: {url} ...")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        json_data = response.json()
    except Exception as e:
        print(f"Error mengambil data: {e}")
        print("Pastikan dev server Next.js Anda sedang berjalan (npm run dev) pada port 3000.")
        return

    # Konversi ke Pandas DataFrame
    data = json_data['data']
    if not data:
        print("Tidak ada data pesanan yang ditemukan untuk training.")
        return

    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)

    print("\n5 Data Pertama dari API:")
    print(df.head())

    # 2. Persiapan Fitur Utama (Kita memprediksi 'totalOrders' berdasarkan data historis)
    # Kita menggunakan fitur: totalOrders (target), isWeekend, dan dayOfWeek
    features = df[['totalOrders', 'isWeekend', 'dayOfWeek']].values

    # Normalisasi data agar bernilai antara 0 dan 1 (Sangat penting untuk kestabilan LSTM)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_features = scaler.fit_transform(features)

    # 3. Membuat Window Sliding untuk Data LSTM (Time-steps)
    # Menggunakan data 7 hari terakhir (look_back = 7) untuk memprediksi hari berikutnya
    def create_dataset(dataset, look_back=7):
        X, y = [], []
        for i in range(len(dataset) - look_back):
            X.append(dataset[i:(i + look_back), :])
            y.append(dataset[i + look_back, 0]) # Indeks 0 adalah 'totalOrders'
        return np.array(X), np.array(y)

    look_back = 7
    if len(scaled_features) <= look_back:
        print(f"\nData terlalu sedikit untuk training (minimal dibutuhkan > {look_back} hari).")
        print(f"Jumlah data saat ini: {len(scaled_features)} hari.")
        return

    X, y = create_dataset(scaled_features, look_back)

    # X shape: (samples, time_steps, features)
    print(f"\nShape Data Input (X): {X.shape} -> (samples, time_steps, features)")
    print(f"Shape Data Target (y): {y.shape}")

    # 4. Membangun Arsitektur Model LSTM
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(look_back, X.shape[2])),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1) # Output prediksi jumlah pesanan di hari ke-8
    ])

    model.compile(optimizer='adam', loss='mean_squared_error')
    print("\nRingkasan Model LSTM:")
    model.summary()

    # 5. Melatih Model (Training)
    print("\nMemulai proses training model LSTM...")
    history = model.fit(X, y, batch_size=4, epochs=30, validation_split=0.1, verbose=1)

    # 6. Plot Hasil Loss Training
    plt.figure(figsize=(10, 5))
    plt.plot(history.history['loss'], label='Training Loss')
    if 'val_loss' in history.history:
        plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('LSTM Model Loss (Mean Squared Error)')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    plt.grid(True)
    print("\nTraining selesai! Grafik Loss akan disimpan sebagai 'lstm_loss_plot.png'.")
    plt.savefig('lstm_loss_plot.png')
    plt.close()

if __name__ == "__main__":
    train_lstm_model()
