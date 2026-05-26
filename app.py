from flask import Flask, render_template, request, jsonify
import os
from PyPDF2 import PdfReader

app = Flask(__name__)

# -----------------------------
# Upload folder configuration
# -----------------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {"pdf"}


# -----------------------------
# Check allowed file type
# -----------------------------
def allowed_file(filename):

    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# -----------------------------
# Legal keyword dictionary
# -----------------------------
legal_dictionary = {

    "tenant": "Tenant means the person renting the property.",

    "landlord": "Landlord is the owner of the property.",

    "agreement": "Agreement is a legally binding contract between two or more parties.",

    "rent": "Rent is the amount paid periodically for using property.",

    "liability": "Liability means legal responsibility for something.",

    "penalty": "Penalty refers to a punishment or fine for breaking a rule.",

    "deposit": "Deposit is money given as security before renting property.",

    "termination": "Termination means legally ending a contract.",

    "clause": "Clause is a specific section of a legal document."

}


# -----------------------------
# Document analysis function
# -----------------------------
def analyze_document(text):

    detected_terms = []
    explanations = []

    text = text.lower()

    for term in legal_dictionary:

        if term in text:

            detected_terms.append(term)

            explanations.append(legal_dictionary[term])

    if detected_terms:

        summary = "Detected Legal Terms: " + ", ".join(detected_terms)

    else:

        summary = "No major legal keywords detected in the document."

    return summary, explanations


# -----------------------------
# Home Page
# -----------------------------
@app.route("/")
def home():

    return render_template("index.html")


# -----------------------------
# Chat analysis
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        message = data.get("message", "")

        summary, explanations = analyze_document(message)

        return jsonify({
            "summary": summary,
            "explanations": explanations
        })

    except Exception as e:

        return jsonify({
            "summary": "Error processing request.",
            "explanations": [str(e)]
        })


# -----------------------------
# Upload and analyze PDF
# -----------------------------
@app.route("/upload", methods=["POST"])
def upload():

    try:

        if "file" not in request.files:

            return jsonify({"error": "No file uploaded."})

        file = request.files["file"]

        if file.filename == "":

            return jsonify({"error": "No file selected."})

        if not allowed_file(file.filename):

            return jsonify({"error": "Only PDF files are allowed."})

        file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)

        file.save(file_path)

        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:

            extracted = page.extract_text()

            if extracted:
                text += extracted

        # limit size for processing
        text = text[:2000]

        summary, explanations = analyze_document(text)

        return jsonify({
            "summary": summary,
            "explanations": explanations
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# -----------------------------
# Run Application
# -----------------------------
if __name__ == "__main__":

    app.run(debug=True)