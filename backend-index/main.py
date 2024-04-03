import pysolr 
import time 
import pandas as pd 
# import request

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


def addFileIntoCore(): 
    print("Preparing data for upload...\n")
    # Read the CSV file into a DataFrame 
    df = pd.read_csv('../data/original_data.csv') # change the path to the data file

    # Remove the unnamed index column
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    df = df.rename(columns={'score': 'reddit_score'})    
    df['counter']=0 # for upvotes and downvotes
    # Convert DataFrame rows to dictionaries and index into Solr 
    docs = df.to_dict(orient='records') 
    print(df.head())

    solr.add(docs) 
 
    # Commit changes to make them visible 
    solr.commit() 
 
    print("\nFiles indexed succesfully.\n") 

def vote(doc_id , vote_type):
    # doc_id = request.form.get('id')
    # vote_type = request.form.get('vote')

    if doc_id and vote_type in ['up' , 'down']:

        doc= solr.search(f'id:{doc_id}').docs[0] # get the document with the id

        if vote_type == 'up':
            print(doc['counter'])
            doc['counter'] +=1
        
        elif vote_type == 'down':
            doc['counter'] -=1
        
        solr.add([doc])
        print("Vote updated succesfully.\n")

def normalQuery(query): #should pass something to it 
    start_time = time.time() 

    results = solr.search(f'spellcheck: {query}', **{ # 'title: move' should be a variable, and append ~3 for fuzzy search  
        'rows' : 5, # rows to display  
        'fl': 'title, subreddit, body' # data to fetch, renive to get all at the cost of time  
    }) # have to sort according to "upvotes" for interactive search 
     
    # The `Results` object stores total results found, by default the top 
    # ten most relevant results and any additional data like 
    # facets/highlighting/spelling/etc. 
    print("Found {0} result(s).\n".format(len(results))) 
 
    # Just loop over it to access the results. 
    # results store all of the data from solr, format(result["smth"]) to print that result 
    for result in results: 
        print("The title is '{0}'.".format(result['title'])) 
        print("The subreddit is '{0}'.".format(result['subreddit'])) 
         
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
        'fl': '* , score', 
        'fq': 'created:[' + start + ' TO ' + end + ']',
        'df': 'spellcheck',
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
def sortAscending(searchString , sortType="reddit_score asc"):
    results = solr.search('title: ' + searchString, **{
        'rows': 5,
        'fl': 'title, subreddit, body',
        'sort': sortType
    })

    for result in results:
        print("The title is '{0}'.".format(result['title']))
        print("The subreddit is '{0}'.".format(result['subreddit']))

        if (format(result['body']) == "['NaN']"):
            print("Body does not exist.\n")
        else:
            print("The body is '{0}'.\n".format(result['body']))

        print("Found spellcheck: {0}.\n".format(results.spellcheck['collations'][1] if 'collations' in results.spellcheck and len(results.spellcheck['collations']) > 1 else "no spellcheck found"))

def main():
    print("Welcome to the Reddit Search Engine")
    print("1. Index files")
    print("2. Normal Search")
    print("3. Timeline Search")
    print("4. Sort Results")
    print("5. Vote on a post")
    print("6. Exit")
    choice = int(input("Enter your choice: "))
    if choice == 1:
        addFileIntoCore()
    elif choice == 2:
        normalQuery()
    elif choice == 3:
        query = input("Enter the query: ")
        start = input("Enter the start date in YYYY-MM-DDTHH:MM:SSZ format: ")
        end = input("Enter the end date in YYYY-MM-DDTHH:MM:SSZ format: ")
        # query = "title: recession"
        # start = "2020-01-01T00:00:00Z"
        # end = "2020-12-31T23:59:59Z"
        timelineSearch(query, start, end)
    elif choice == 4:
        searchString = input("Enter the search query: ")
        sortType = input("Enter the sort type: [reddit_score asc/desc]")
        sortAscending(searchString, sortType)
    elif choice == 5:
        doc_id = input("Enter the document id: ")
        vote_type = input("Enter the vote type: [up/down]")
        vote(doc_id, vote_type)
    else:
        exit(0)

if __name__ == "__main__":
    main()