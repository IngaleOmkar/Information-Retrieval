
# Reddit Finance Search Engine

This is the code repository for the implementation of the Reddit Finance Search Engine created by Team 29 for the course assignment of CZ4034: Information Retrieval @ NTU. 

Table of Contents:
- [Installation](installation)
- [Setup](setup)

# Installation
To install the code repository run the following command:

```bash
git clone https://github.com/IngaleOmkar/Information-Retrieval.git
```

# Setup
To setup the code base, follow these steps:

- Setting up Solr
  - Open Terminal/Command Prompt in the "Information-Retrieval" folder and execute the following commands.
    
    ```bash
    cd backend-index
    cd solr-9.5.0
    bin/solr start
    ```
    
  - On Unix based systems, if you get an error with file permissions, you can execute the following command before starting solr:
      
    ```bash
    chmod +x bin/solr
    ```
    
- Setting up the Flask server
  - Create a python env. If you are using anaconda, you can run:
    
    ```bash
    conda create -n irproj python=3.9 #irproj is the name of the env
    conda activate irproj
    pip install -r requirements.txt
    ```
    
  - Open Terminal/Command Prompt in the "Information-Retrieval" folder and execute the following commands.
    
    ```bash
    cd backend-index
    flask run
    ```

- Setting up the front end

  ```bash
  cd ir-app
  npm install
  npm start
  ```
