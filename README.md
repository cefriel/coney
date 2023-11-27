# Coney - Community Edition

Coney is a complete toolkit developed by [Cefriel](https://www.cefriel.com/) for CONversational survEYs offering components to design and administer surveys, and to analyse data.

<p align="left"><img src="/coney-community.png" alt="Coney components" width="600"></p>

### Abstract

Coney is an innovative toolkit designed to enhance the user experience in surveys completion. Coney exploits a conversational approach: on the one hand, Coney allows modelling a conversational survey with an intuitive graphical editor; on the other hand, it allows publishing and administering surveys through a chat interface. Coney allows defining an arbitrary acyclic graph of interaction flows, in which the following question depends on the previous answer provided by the user. This offers a high degree of flexibility to survey designers that can simulate a human to human interaction, with a storytelling approach that enables different personalized paths. Coney’s interaction mechanism exploits the advantages of qualitative methods while performing quantitative research, by linking questions to the investigated variables and encoding answers. A preliminary evaluation of the approach shows that users prefer conversational surveys to traditional ones.

Coney's underlying data model is based on the [survey ontology](https://w3id.org/survey-ontology) that we designed to represent, annotate, export and share both the questionnaire structure and the gathered responses. Furthermore, questions and answers can be semantically annotated at design time to easily elaborate and inter-link the collected data at analysis time. 

You can know more about Coney and try it at [coney.cefriel.com/](https://coney.cefriel.com/)!

### Clone the repository

To clone the repository you can run the following command:
```
git clone https://github.com/cefriel/coney.git
```

The development is no longer handled using submodules.

### Toolkit Usage

The repository contains a docker-compose file to build and deploy the entire project. Each Coney component contains its own Dockerfile to build the related Docker image.

A utility script is added to the repository to handle common commands. Check line endings before running it on Windows.

```
$ sh coney.sh help

Usage: <command> [image] [options]

Commands:
         build           Builds the selected image with the available 'environment.ts' file
         up              Starts the selected container (all if no image is specified)
         stop            Stops the selected container (all if no image is specified)

Images:
         api             Coney's Application Programming Interface
         create          Conversation editor
         chat            User's chat endpoint
         inspect         Realtime data visualization tool

Options:
         --env-cp        Rewrites the environment.ts file in the Angular service(s)
```

### Deployment

The provided docker-compose file is configured to launch a local instance of Coney. We assume [Docker](https://docs.docker.com/get-docker/) is up and running on your machine. Then execute the following commands to launch Coney (depending on your operating system you may need to run the commands using `sudo` to reach the Docker Daemon):

```
sh coney.sh build
sh coney.sh up
```

To deploy Coney in a different environment the following actions are required to configure the deployment.  

_Basic deployment_:
- Edit the `nginx.conf` file to configure the reverse-proxy. In particular update the `server_name`. 
- Set the `BASE_HREF` for Angular using the related env variable when launching the build with docker-compose.
	```
	export BASE_HREF=/coney
	docker-compose build --no-cache
	```
- Change the file `environment.ts` to set the `baseUrl` that should used by Coney components to reach the back-end (coney-api).
- Change the file `environment.ts` to set the `privacyUrl` shown to users compiling surveys through the coney-chat component.
- Launch the build using the `--env-cp` option
	```
	sh coney.sh build --env-cp
	```

_Notes_:
- Unpublished surveys and `coney-api` logs are saved in the `coney-data` folder in the host filesystem. The content of the `coney-data` folder is added to the `.gitignore` file by default.
- The docker-compose deployment can be initialized with a set of surveys. 
Put coney-create files in `coney-data` and update the `query.sh` file to initialize the database accordingly.
A default coney-demo survey is provided. `TODO` create a script to automatically build queries given the content of `coney-data` folder.
- Pay attention to line endings when modifying the `query.sh`, they should be UNIX style.
- Data of Neo4j are persisted in a `neo4j/` folder in the host filesystem. The `neo4j/` folder is added to the `.gitignore` file.

### Components
Once running, the landing page is available at `localhost/coney`. All components are masked by a reverse-proxy.

Components are reachable at the following addresses:
- coney-create `localhost/coney/create`
- coney-inspect `localhost/coney/inspect`
- coney-chat `localhost/chat` (a valid payload is needed to correctly visualize the chat component)

The backend API can be reached at `localhost/coney-api/<method_name>`. If enabled at build time, the API documentation is available at `localhost/coney-api/swagger-ui.html`.

More information on the components and how to use them are available in the repository Wiki.

### Coney Enterprise Edition

The Coney Enterprise Edition is mainly based on the open source components, but offers additional features:
- Multi-user and multi-project features to support hierarchies and access levels for surveys
- Centralized console to access Coney components and browse projects and surveys
- Link personalization for survey delivery (users, metadata, limit to number completions)
- Chat interface personalization (colors, logo, etc.)
 
If you are interested, if you simply want to know more, and/or if you need help in the survey design process contact us at [coney-dev@cefriel.com](mailto:coney-dev@cefriel.com).

### Coney In-Use

Published studies using Coney:
- Survey Study about Motivation for Participants in Citizen Science Projects [Data set]. Zenodo. https://doi.org/10.5281/zenodo.5753091
- Ride2Rail Choice Criteria Survey Dataset [Data set]. Zenodo. http://doi.org/10.5281/zenodo.4593471

To add something to the list please either submit a pull request or open an issue.

### Publications

To know more in details the project you can access related pubblications:
- _CHItaly 2019_: Extended abstract and poster "CONEY: A CONversational survEY Toolkit" on [Zenodo](https://doi.org/10.5281/zenodo.3446014)
- _IJHCS 2020_: Journal paper "Submitting surveys via a conversational interface: An evaluation of user acceptance and approach effectiveness" on [Arxiv](https://arxiv.org/pdf/2003.02537.pdf)

### Cite as

If you used Coney in your work, please cite the IJHCS article:

> Irene Celino and Gloria Re Calegari: _Submitting surveys via a conversational interface: an evaluation of user acceptance and approach effectiveness_, International Journal of Human Computer Studies, Vol. 139, DOI: [10.1016/j.ijhcs.2020.102410](https://doi.org/10.1016/j.ijhcs.2020.102410), 2020.

BibTeX reference:

```bib
@article{celino2020submitting,
title = "Submitting surveys via a conversational interface: An evaluation of user acceptance and approach effectiveness",
journal = "International Journal of Human-Computer Studies",
volume = "139",
pages = "102410",
year = "2020",
issn = "1071-5819",
doi = "https://doi.org/10.1016/j.ijhcs.2020.102410",
author = "Irene Celino and Gloria {Re Calegari}"
}
```

### License

_Copyright 2020 Cefriel._

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

### Acknowledgement

This project is partially supported by the ACTION project (grant agreement number 824603), co-funded by
the European Commission under the Horizon 2020 Framework Programme.
