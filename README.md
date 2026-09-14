# Football Player Classification

A Machine Learning project that classifies football players from images.

The model is currently trained to recognize 5 players:

- Lionel Messi
- Lamine Yamal
- Mohamed Salah
- Kylian Mbappé
- Cristiano Ronaldo

The current version uses 5 players mainly to reduce the time needed to collect and prepare the dataset. More players can be added in future updates.

## How It Works

The project uses OpenCV for face detection and image processing.

After detecting the face, Wavelet Transform is used for feature extraction, and different Machine Learning models were tested, including:

- SVM
- Logistic Regression

For the classification to work properly, the player's face should be clear, especially the eyes. Clear facial features help the face detection and feature extraction steps work more accurately. If the face is covered or the eyes are not visible, the classification may become less accurate.

## Web Interface

The trained model is connected to a simple web interface using Flask.

You can upload an image through the interface and get the predicted player.

## Technologies
Python
NumPy
Pandas
OpenCV
PyWavelets
Scikit-learn
Flask
HTML
CSS
JavaScript

## Running the Project

Clone the repository:

[git clone https://github.com/SamyElnagar11/FootballPlayerClassifier.git]

Install the required Python libraries and run the Flask server.

Then open the web interface and upload an image to classify the player.

## Project Status

The current version supports 5 football players.

More players can be added later by collecting and preparing additional training data.

## Project Structure

```text
FootballPlayerClassifier/
│
├── About/
│   └── Testing images and project screenshots
│
├── UI/
│   ├── app.html
│   ├── app.css
│   └── app.js
│
├── model/
│   ├── Football_players_classification.ipynb
│   ├── class_dictionary.json
│   ├── dataset/
│   ├── saved_model.pickle
│   └── test_images.rar
│
└── server/
    ├── server.py
    ├── util.py
    ├── wavelet.py
    ├── artifacts/
    └── opencv/