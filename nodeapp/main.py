import requests #need readme file and download requests 

# Define the Solr search endpoint URL
solr_url = 'http://localhost:8983/solr/data/select'

# Define the search parameters
params = {
    'q': 'your_query',
    'rows': 10,  # Number of rows to return
    'fl': 'id,title,content',  # Fields to include in the response
}

# Send the search request
response = requests.get(solr_url, params=params)

# Check if the request was successful
if response.status_code == 200:
    # Parse and process the search results
    search_results = response.json()
    print(search_results)
else:
    print('Error:', response.status_code)