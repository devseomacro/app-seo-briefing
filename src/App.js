import React, { useState,useEffect } from "react";
import { GoogleLogin, useGoogleLogin } from "react-google-login";
import {gapi} from 'gapi-script';
import {createPdf} from './services/api';


import {
	DataSheetGrid,
	checkboxColumn,
	textColumn,
	keyColumn,
  } from 'react-datasheet-grid';

  // Import the style only once in your app!
import 'react-datasheet-grid/dist/style.css'

const clientId = "482660746898-6fida1v0ka18t4033cc6jrt8p1494k0s.apps.googleusercontent.com";
const clientSecret = "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";
const API_KEY = "AIzaSyCrqaaXEpLjzKVCbZgiykwmrl-BjnqPlps";
const SCOPES = "https://www.googleapis.com/auth/documents";
const DISCOVERY_DOCS = ['https://docs.googleapis.com/$discovery/rest?version=v1'];



function App() {
	const [document_id, setDocumentId] = useState(null);
	const [text, setText] = useState([])
	const [title, setTitle] = useState('')
	const [ items, setData ] = useState([
		{ type: '', keyword: '', incluir: '' },
	  ])


	

	useEffect(()=>{ 
		gapi.load('client:auth2', function(){
			gapi.client.init({
				apiKey: API_KEY,
				clientId : clientId,
				scope: SCOPES,
				discoveryDocs: DISCOVERY_DOCS, 
			}).then(() => {
				if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
					gapi.auth2.getAuthInstance().signIn()
				  }				
			})
		})
	  },[])
	

	  async function criarBriefing(){

		let accesToken = gapi.auth.getToken().access_token;

		const titleDoc = items.map((el)=>{
			if(el.type ==='h1'){
				const title = el.keyword;
				setTitle(title);	
			}
			return title
			alert(title);
			});



			gapi.client.docs.documents.create({
				title : "Briefing: "+ titleDoc,
		  }).then((onfulfill, onreject, context) => {
			  console.log('fulfilled', onfulfill);
			  const documentID =onfulfill.result.documentId;

			  const urlUpdate = 'https://docs.googleapis.com/v1/documents/'+documentID+':batchUpdate?key=' +API_KEY;	

			  items.forEach((el)=>{
				setText({text : el.keyword});
			})

		  
			  // We'll put all our requests in here
			  let requests = [];
		  
			  // This reverses the array so we can build the document backwards.
			  // See the note about adding content in reverse.
			  items
				.slice()
				.reverse()
				.forEach((lineOfText, index) => {
					requests = requests.concat([
						{
						  insertText: {
							text: `${lineOfText.keyword}\n`,
							location: {
							  index: 1,
							},
						  },
						},
					]);	
					if(lineOfText.incluir != undefined){
						requests = requests.concat([
							{
							  insertText: {
								text: `incluir: ${lineOfText.incluir}\n`,
								location: {
								  index: 1,
								},
							  },
							},
						]);	
					}

				});

			
			console.log(text)
			  fetch(urlUpdate, {
						method: "POST",
						headers: new Headers({
						'Authorization' : 'Bearer '+ accesToken,
						"Content-Type": "application/json",
						}),
	
						body: JSON.stringify({						
							requests:requests,	
						}),
						}).then((res) => {
						return res.json();
						}).then(function (){
						window.open("https://docs.google.com/document/d/" +documentID+"/edit","_blank" )
						//console.log(val.documents);
						}).catch(err => console.error(err.body))


			})
			const data = {
				data : items,
			   }
			   try {
				 const briefing = await createPdf(data); 
				 console.log(briefing.data?.url);  
				 window. open(briefing.data?.url)            
				 } catch (error) {
				 console.log(error);
			   }

		}
		
	
	
		/*   const data = {
			data : items,
		   }
		   try {
			 const briefing = await createPdf(data); 
			 console.log(briefing.data?.url);  
			 window. open(briefing.data?.url)            
			 } catch (error) {
			 console.log(error);
		   }*/


	  const columns = [
		{
		  ...keyColumn('type', textColumn),
		  title: 'TIPO',
		},
		{
		  ...keyColumn('keyword', textColumn),
		  title: 'KEYWORD',
		},
		{
		  ...keyColumn('incluir', textColumn),
		  title: 'INCLUIR',
		},
	  ]
	return (
		<>
	 	
				<DataSheetGrid
					value={items}
					onChange={setData}
					columns={columns}
					/>

					<button onClick={()=>criarBriefing()}>Criar Briefing </button>

		</>
		
			

	);
}

export default App;
