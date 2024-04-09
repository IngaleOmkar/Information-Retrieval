from flask import Flask, request, jsonify
from flask_cors import CORS
from main import query_test

app = Flask(__name__)
CORS(app)

@app.route('/query', methods=['GET'])
def query():
    query = request.args.get('q')
    query_response = query_test(query)
    return jsonify(query_response)

    # query_param = request.args.get('q')
    # return jsonify({'query': query_param})

if __name__ == '__main__':
    app.run(debug=True)