import json
from flask import Flask, jsonify, request
from main import combinedQuery , vote, addFileIntoCore
import pysolr 
import pandas as pd
import atexit
from flask_cors import CORS

solr = pysolr.Solr('http://localhost:8983/solr/cz4034')
solr.ping()

app = Flask(__name__)

CORS(app)

df = pd.read_csv('../data/updated_data.csv') # change the path to the data file

# Remove the unnamed index column
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
# df = df.rename(columns={'score': 'reddit_score'}) # do not perform this if the input data is "../data/original_dataTest.csv"
# df['counter'] = 0 # do not perform this if the input data is "../data/original_dataTest.csv"

addFileIntoCore()

@atexit.register
def save():
    df.to_csv('../data/updated_data.csv') #change name later

@app.route('/get_query', methods=['POST'])
def get_query():
    try:
        data = request.json
        print("in get query data: " , data)
        query =  data['query']
        start = data['start']
        end = data['end']
        sort_type = data['sort_type']
        print("query: " , query)
        results = combinedQuery(query, start, end, sort_type)

        # return status and results in json format
        return jsonify(status=200, results=results)
    except Exception as e:
        return jsonify(status=500, error=str(e))

@app.route('/vote_relevance' , methods=['POST'])
def vote_relevance():
    try:
        global df
        data = request.json
        doc_id = data['doc_id']
        vote_type = data['vote_type']
        query = data['query']
        start = data['start']
        end = data['end']
        sort_type = data['sort_type']

        results , df = vote(df, doc_id, vote_type , query , start , end , sort_type)

        return jsonify(status=200, results=results)
    except Exception as e:
        return jsonify(status=500, error=str(e))

@app.route('/add_docs' , methods=['POST'])
def add_docs():
    resutls = addFileIntoCore()

    if(resutls==True):
        return jsonify(status= 200 , message="Documents added to core successfully")
    else:
        return jsonify(status= 500 , message="Error in adding documents to core" , error=resutls)

if __name__ == '__main__':
   app.run(port=5000 , debug=True)
   