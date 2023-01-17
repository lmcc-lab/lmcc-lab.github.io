from flask import Flask, render_template, request
from scripts.bank.getData import UpData
import json
from flask_cors import CORS
from flask import send_file
import pandas as pd
import csv
import os
import time

app = Flask(__name__)
CORS(app, origins=['*'])


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/stock')
def stock():
  return render_template('stock.html')


@app.route('/databases/stock.csv')
def serve_csv():
    try:
        return send_file('databases/stock.csv', attachment_filename='stock.csv')
    except Exception as e:
        return str(e)


@app.route("/search", methods=["POST"])
def search():
    # Get the search term from the request
    search_term = request.form["searchTerm"]
    start_date = request.form["startDate"]
    end_date = request.form["endDate"]
    # Process the search term and get the results
    results = get_results(search_term, start_date, end_date)
    # Return the results as a JSON object
    return json.dumps(results)


@app.route("/save_stock", methods=["POST"])
def save_stock_data():
    save_name = request.form["title"]
    save_amount = request.form["value"]

    # reading the csv file
    try:
        df = pd.read_csv("databases/stock.csv")
    except pd.errors.EmptyDataError:
        df = pd.DataFrame([], columns=[])
    if save_name not in df.head() and save_amount != "null":
        df[save_name] = save_amount
    elif save_amount == "null":
        df = df.drop(save_name, axis=1)
    else:
        # updating the column value/data
        df.loc[0, save_name] = save_amount

    # writing into the file
    df.to_csv("databases/stock.csv", index=False)
    return "200"


def get_results(search_term, start_date, end_date):
    # This is a placeholder for the function that would process the search term
    # and return the results
    Up = UpData(start_date, end_date)
    if search_term != '':
        result = Up.get_payment_only(search_term)
        simp = Up.simplify_transaction(result)
        final = Up.make_pretty(simp)
    else:
        final = list(Up.show_all_transaction_descriptions(payments_only=True))
    return final


@app.route('/save-image', methods=["POST"])
def save_image():
    # Get the file from the request
    file = request.files["file"]
    # Set the folder path to save the image
    folder_path = "static/images"
    # Save the file to the specified folder
    file.save(os.path.join(folder_path, file.filename))
    return "Image saved successfully!", 200


@app.route('/delete-image', methods=["POST"])
def delete_image():
    filename = request.form["name"]
    os.remove(f'static/images/{filename}.jpg')
    return "OK", 200


if __name__ == "__main__":
    while True:
        app.run()
        time.sleep(10)
