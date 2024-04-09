import json
from flask import Flask, jsonify, request
from main import combinedQuery , vote, addFileIntoCore
import pysolr 
import pandas as pd
import atexit

solr = pysolr.Solr('http://localhost:8983/solr/cz4034')
solr.ping()

app = Flask(__name__)

df = pd.read_csv('../data/original_dataTest.csv') # change the path to the data file

# Remove the unnamed index column
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
# df = df.rename(columns={'score': 'reddit_score'}) # do not perform this if the input data is "../data/original_dataTest.csv"
# df['counter'] = 0 # do not perform this if the input data is "../data/original_dataTest.csv"

@atexit.register
def save():
    df.to_csv('../data/original_dataTest.csv') #change name later

@app.route('/get_query', methods=['GET'])
def get_query():
    data = request.json
    query = data['query']
    start = data['start']
    end = data['end']
    sort_type = data['sort_type']
    results = combinedQuery(query, start, end, sort_type)
    return results

@app.route('/vote_relevance' , methods=['POST'])
def vote_relevance():
    global df
    data = request.json
    doc_id = data['doc_id']
    vote_type = data['vote_type']
    query = data['query']
    start = data['start']
    end = data['end']
    sort_type = data['sort_type']

    results , df = vote(df, doc_id, vote_type , query , start , end , sort_type)

    return results

@app.route('/add_docs' , methods=['POST'])
def add_docs():
    resutls = addFileIntoCore()

    if(resutls==True):
        return {"message": "Documents added to core successfully"}
    else:
        return {"message": "Documents not added to core" , "error": resutls}

if __name__ == '__main__':
   app.run(port=5000)
   