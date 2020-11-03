/* eslint-disable semi */
/* eslint-disable max-len */
const Alexa = require('ask-sdk-core')
const axios = require('axios');

// skill name
const appName = 'Guru'


async function getCollege(city, state, schoolType) {
  const apikey = process.env.college_API_KEY

  let whereStr = ''

  if (schoolType === 'public') { whereStr = '&school.ownership=1' }
  else if (schoolType.includes('private') && schoolType.includes('nonprofit')) { whereStr = '&school.ownership=2' }
  else if (schoolType.includes('private') && (schoolType.includes('for-profit') || schoolType.includes('for profit'))) { whereStr = '&school.ownership=3' }
  else { whereStr = '' }

  whereStr = `api_key=${apikey}&school.city=${city}&school.state=${state}${whereStr}`

  const apiUrl = `https://api.data.gov/ed/collegescorecard/v1/schools?${whereStr}&fields=id,ope6_id,ope8_id,school.name,2013.student.size,school.zip,school.city,school.state,school.ownership`

  console.log({ apiUrl })
  const response = await axios.get(apiUrl);

  return await response.data.results;
}

// code for the handlers

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    // welcome message
    let speechText = 'welcome to Guru, virtual guide for selecting dream college. Please say state';
    // welcome screen message
    let displayText = 'welcome to Guru, virtual guide for selecting dream college. Please say state'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(appName, displayText)
      .getResponse();
  }
};

// implement custom handlers
const SearchIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'searchIntent'
  },
  async handle(handlerInput) {
    let speechText = '';
    let displayText = '';
    let intent = handlerInput.requestEnvelope.request.intent;
    let city = intent.slots.city.value;
    let state = intent.slots.state.value;
    let schoolType = intent.slots.schoolType.value;

    if (state && city && schoolType) {
      const result = await getCollege(city, state, schoolType) //results.school.name

      speechText = 'I found ' + result.length.toString() + ' colleges in ' + city + ' in the state of ' + state + '. \n '

      for (let i = 0; i < result.length; i++) {
        speechText = speechText + '' + (i + 1).toString() + ' ' + result[i]['school.name']; //result.id.toString();
      }

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(appName.displayText)
        .withShouldEndSession(true)
        .getResponse();
      //})
    } else {
      return handlerInput.responseBuilder
        .addDelegateDirective(intent)
        .getResponse();
    }
  }
}


// end Custom handlers

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    // help text for your skill
    let speechText = '';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(appName, speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    let speechText = 'Goodbye';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(appName, speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};

// Lambda handler function
// Remember to add custom request handlers here
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler,
    SearchIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)

  .lambda();
