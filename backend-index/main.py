import json
import pysolr 
import time 
import pandas as pd 
import atexit
# import requests

import re
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt

# Create a client instance. The timeout and authentication options are not required. 
solr = pysolr.Solr('http://localhost:8983/solr/cz4034') #cz4034 is the core 
 
# solr.add("../data.csv") #cannot be a file, need to index every single file  
 
# Note that auto_commit defaults to False for performance. You can set 
# auto_commit=True to have commands always update the index immediately, make 
# an update call with commit=True, or use Solr's autoCommit / commitWithin 
# to have your data be committed following a particular policy. 
 
# Do a health check. 
solr.ping() # optional 
 
# Later, searching is easy. In the simple case, just a plain Lucene-style 
# query is fine. 
#results = solr.search('title: recession', rows=5) # GET 
 
# For a more advanced query, say involving highlighting, you can pass 
# additional options to Solr. 
# results = solr.search('bananas', **{ 
#     'hl': 'true', 
#     'hl.fragsize': 10, 
# }) 
 
# Finally, you can delete either individual documents, 
# solr.delete(id='doc_1') 
 
# also in batches... 
# solr.delete(id=['doc_1', 'doc_2']) 
 
# ...or all documents. 
#solr.delete(q='*:*') 
df = pd.read_csv('../data/final_data.csv') # change the path to the data file

# Remove the unnamed index column
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

def addFileIntoCore(): 
    print("Preparing data for upload...\n")
    # Read the CSV file into a DataFrame 

    #df = df.rename(columns={'score': 'reddit_score'}) #manually edit or let it run once only
    #df['counter']=0 # let it run once only
    # Convert DataFrame rows to dictionaries and index into Solr 

    global df
    docs = df.to_dict(orient='records') 
    print(df.head())

    try:

        # Add documents to Solr
        solr.add(docs)

        # Commit changes to make them visible
        solr.commit()

        print("Documents added and committed successfully.")
        return True
    
    except Exception as e:
        print("Error: ", e)
        return e

def vote(df, doc_id , vote_type , query , start, end, sort_type):
    # doc_id = request.form.get('id')
    # vote_type = request.form.get('vote')
    try:

        doc = solr.search(f'id: {doc_id}').docs[0]
        current_counter = doc['counter']

        # edit the counter of the document
        if vote_type == 'up':
            #print(doc['counter'])
            #doc['counter'] +=1
            df.loc[df["id"] == doc_id, 'counter'] = current_counter + 1
            solr.add({
                "id": doc_id,
                "counter": {"inc": 1},
            })
        
        elif vote_type == 'down':

            df.loc[df["id"] == doc_id, 'counter'] = current_counter - 1
            solr.add({
                "id": doc_id,
                "counter": {"inc": -1},
            })            

        # commit the changes
        solr.commit()

        # return the updated document
        results = combinedQuery(query, start, end, sort_type)
        return results , df

    except Exception as e:
        print("Error: ", e)

def normalQuery(query): #should pass something to it 
    start_time = time.time()
    results = solr.search(f'{query}', **{ # 'title: move' should be a variable, and append ~3 for fuzzy search  
        'rows' : 5, # rows to display  
        'fl': 'title, subreddit, body, score', # data to fetch, renive to get all at the cost of time  
        'df': 'spellcheck', # default field to search
        'defType': 'dismax', # use dismax query parser
        'bf': 'counter^2'# boost the counter field to make the upvoted posts appear first
    }) # have to sort according to "upvotes" for interactive search 
     
    # The `Results` object stores total results found, by default the top 
    # ten most relevant results and any additional data like 
    # facets/highlighting/spelling/etc. 
    print("Found {0} result(s).\n".format(len(results))) 
    print("Found spellcheck: {0}.\n".format(results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"))
 
    # Just loop over it to access the results. 
    # results store all of the data from solr, format(result["smth"]) to print that result 
    for result in results: 
        print("The title is '{0}'.".format(result['title'])) 
        print("The subreddit is '{0}'.".format(result['subreddit'])) 
        print("The score is '{0}'.".format(result['score']))
         
        if (format(result['body']) == "['NaN']"): 
            print("Body does not exist.\n") 
         
        else: 
            print("The body is '{0}'.\n".format(result['body'])) 
         
        # try: # dosnt work after importing data with pandas as it changes empty to NaN 
        #     print("The body is '{0}'.\n".format(result['body'])) 
 
        # except Exception as e: 
        #     print("Body does not exist\n") 
 
 
    end_time = time.time() 
    elapsed_time = end_time - start_time 
         
    # Print the elapsed time 
    print("\n\nElapsed time: %.3f seconds\n" %elapsed_time) 

def query_test(query):
    results = solr.search(f'{query}', **{ # 'title: move' should be a variable, and append ~3 for fuzzy search  
        'rows' : 5, # rows to display  
        'fl': 'title, subreddit, body, score', # data to fetch, renive to get all at the cost of time  
        'df': 'spellcheck', # default field to search
        'defType': 'dismax', # use dismax query parser
        'bf': 'counter^2'# boost the counter field to make the upvoted posts appear first
    }) # have to sort according to "upvotes" for interactive search 

    # iterate over the results and create a json object
    response = {}
    response['total_results'] = results.hits
    response['query_time'] = results.qtime
    response['documents'] = results.docs

    return json.dumps(response)

def timelineSearch(query, start , end):
    # assumption is that the date is in the format "YYYY-MM-DDTHH:MM:SSZ"
    # if the start and end date are not provided, set them to NOW and * respectively
    if (start == ""):
        start = "*"
    if (end == ""):
        end = "NOW"

    # if the start date is after the end date, swap them
    if (start > end):
        start, end = end, start

    print("Searching for '{0}' between {1} and {2}.".format(query, start, end))

    results = solr.search(query , **{ 
        'rows' : 5,
        'fl': 'title, subreddit, body, score', 
        'fq': 'created:[' + start + ' TO ' + end + ']',
        'df': 'spellcheck',
        'defType': 'dismax', # use dismax query parser
        'bf': 'counter^2'# boost the counter field to make the upvoted posts appear first
    }) 

    print("Found {0} result(s).\n".format(len(results))) 
    print("Found spellcheck: {0}.\n".format(results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"))

    if (len(results) == 0):
        print("No results found.\n")
        return
    
    text = ""

    for result in results: 
        print("The title is '{0}'.".format(result)) 
         
        if (format(result['body']) == "['NaN']"): 
            print("Body does not exist.\n") 
            text += str(result['title']) + " "
         
        else: 
            body = re.sub(r'\n+', ' ', str(result['body']))
            text += str(result['title']) + " " + body + " "
            print("The body is '{0}'.\n".format(result['body']))
            print("The score is '{0}'.\n".format(result['score']))

    generateWordcloud(text)

def generateWordCloudWithResults(results):
    print("in method")
    text = ''
    for result in results: 
        if (format(result['body']) == "['NaN']"): 
            text += str(result['title']) + " "
        else: 
            body = re.sub(r'\n+', ' ', str(result['body'][0]))
            body = str(result['body'][0]).strip().replace('\n', ' ').replace('\r', ' ').replace('\n\n', '').replace('\r\n', ' ').replace('\r\r', ' ').replace('\n\r', ' ').replace('*','').replace('/s','')
            text += str(result['title']) + " " + body + " "
        #print(text)

    stopwords = set(STOPWORDS)
    # generate the word cloud
    wordcloud = WordCloud(width = 800, height = 800, 
                background_color ='white', 
                stopwords = stopwords, 
                min_font_size = 10).generate(text)
    
    print("Before saving")
    
    # save the word cloud to a file
    # wordcloud.to_file('static/wordcloud.png')
    wordcloud.to_file('../ir-app/src/assets/images/wordcloud.png')


def generateWordcloud(text):
    # generate the word cloud
    # remove the stopwords
    stopwords = set(STOPWORDS)
    # generate the word cloud
    wordcloud = WordCloud(width = 800, height = 800, 
                background_color ='white', 
                stopwords = stopwords, 
                min_font_size = 10).generate(text)
    
    # plot the word cloud
    plt.figure(figsize = (8, 8), facecolor = None)
    plt.imshow(wordcloud)
    plt.axis("off")
    plt.tight_layout(pad = 0)

    plt.show()

# sortType can be 'reddit_score desc' or 'reddit_score asc'
def sortAscending(searchString , sort_type="reddit_score asc"):
    results = solr.search( searchString, **{
        'rows': 5,
        'fl': 'title, subreddit, body, score',
        'df' : 'spellcheck',
        'sort': sort_type,
        'defType': 'dismax', # use dismax query parser
        'bf': 'counter^2'
    })
    
    print("Found spellcheck: {0}.\n".format(results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"))

    for result in results:
        print("The title is '{0}'.".format(result['title']))
        print("The subreddit is '{0}'.".format(result['subreddit']))
        print("The score is '{0}'.".format(result['score']))

        if (format(result['body']) == "['NaN']"):
            print("Body does not exist.\n")
        else:
            print("The body is '{0}'.\n".format(result['body']))

        print("Found spellcheck: {0}.\n".format(results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"))

# combined timeline, query, sort search
def combinedQuery(query, start="", end="", sort_type=""):
    start_time = time.time()

    queryParams = {
            'rows' : 10000,
            'fl': 'id, title, subreddit, created , body, score , reddit_score, predicted_sentiment',
            'df': 'spellcheck',
            'defType': 'dismax', # use dismax query parser
            'bf': 'counter^2'# boost the counter field to make the upvoted posts appear first
    }

    # handle sentiment processing
    if (sort_type["sentiment"]!=""):
        queryParams['fq'] = 'predicted_sentiment:' + sort_type["sentiment"].lower()

    # handle date ordering
    if (start == ""):
        start = "*"
    else:
        start += "T00:00:00Z"
    if (end == ""):
        end = "NOW"
    else:
        end += "T23:59:59Z"

    if ('fq' in queryParams and queryParams['fq'] != ""):
        queryParams['fq'] += ' AND created:[' + start + ' TO ' + end + ']'
    else:
        queryParams['fq'] = 'created:[' + start + ' TO ' + end + ']'

    # handle sorting
    sort = ""
    if (sort_type["time"] != ""):
        sort = sort_type["time"]
    if (sort_type["score"] != "" and sort !=""):
        sort += " , "
        sort += sort_type["score"]
    elif (sort_type["score"] != ""):
        sort = sort_type["score"]

    if (sort != ""):
        queryParams['sort'] = sort

    print("Query Params: " , queryParams)

    results = solr.search(f'{query}', **queryParams)
     
    # The `Results` object stores total results found, by default the top 
    # ten most relevant results and any additional data like 
    # facets/highlighting/spelling/etc. 
    print("Found {0} result(s).\n".format(len(results))) 
    print("Found spellcheck: {0}.\n".format(results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"))
 
    # Just loop over it to access the results. 
    # results store all of the data from solr, format(result["smth"]) to print that result 
    for result in results: 
        print("The title is '{0}'.".format(result['title'])) 
        print("The subreddit is '{0}'.".format(result['subreddit'])) 
        print("The score is '{0}'.".format(result['score']))
         
        if (format(result['body']) == "['NaN']"): 
            print("Body does not exist.\n") 
         
        else: 
            print("The body is '{0}'.\n".format(result['body'])) 
 
    end_time = time.time() 
    elapsed_time = end_time - start_time 
         
    # Print the elapsed time 
    print("\n\nElapsed time: %.3f seconds\n" %elapsed_time) 

    response= {}
    response["total_results"] = results.hits
    response["query_time"] = results.qtime
    response["documents"] = results.docs
    response["spellcheck"] = results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"
    response["wordcloud"] = results.hits >0
    
    if (results.hits > 0):
        print("GENERATING WORDCLOUD")
        generateWordCloudWithResults(results.docs)
        print("GENERATED WORDCLOUD")
    
    
    return response

def main():
    global df
    while(1): #to remove
        print("Welcome to the Reddit Search Engine")
        print("1. Index files")
        print("2. Normal Search")
        print("3. Timeline Search")
        print("4. Sort Results")
        print("5. Vote on a post")
        print("6. Combined Query")
        print("7. Exit")
        choice = int(input("Enter your choice: "))
        if choice == 1:
            addFileIntoCore()
        elif choice == 2:
            query = input("Enter the query: ")
            normalQuery(query)
        elif choice == 3:
            query = input("Enter the query: ")
            start = input("Enter the start date in YYYY-MM-DD format: ")
            end = input("Enter the end date in YYYY-MM-DD format: ")

            query = "title: " + query
            start += "T00:00:00Z"
            end += "T23:59:59Z"

            # query = "title: recession"
            # start = "2020-01-01T00:00:00Z"
            # end = "2020-12-31T23:59:59Z"
            timelineSearch(query, start, end)
        elif choice == 4:
            searchString = input("Enter the search query: ")
            sort_type = input("Enter the sort type: [reddit_score asc/desc]")
            sortAscending(searchString, sort_type)
        elif choice == 5:
            doc_id = input("Enter the document id: ")
            vote_type = input("Enter the vote type: [up/down]")
            query = input("Enter the query: ")
            vote(doc_id, vote_type , query)
        elif choice == 6:
            query = input("Enter the query: ")
            start = input("Enter the start date in YYYY-MM-DD format: ")
            end = input("Enter the end date in YYYY-MM-DD format: ")
            sort_type = input("Enter the sort type: [reddit_score asc/desc]")
            combinedQuery(query, start, end, sort_type)
        else:
            @atexit.register
            def save():
                df.to_csv('../data/original_dataTest.csv') #change name later

            exit(0)

if __name__ == "__main__":
    main()