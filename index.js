
const dynamoDB = require('./utility');
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
const PERMISSIONS = ['alexa::profile:name:read', 'alexa::profile:email:read']
const messages = {
  WELCOME: 'welcome to Guru, virtual guide for selecting dream college. What do you want to ask?You can search colleges by state, city, school type and school name',
  WHAT_DO_YOU_WANT: 'What do you want to ask?',
  NOTIFY_MISSING_PERMISSIONS: 'Please enable Customer Profile permissions in the Amazon Alexa app.',
  NAME_MISSING: 'You can set your name either in the Alexa app under calling and messaging, or you can set it at Amazon.com, under log-in and security.',
  EMAIL_MISSING: 'You can set your email at Amazon.com, under log-in and security.',
  NUMBER_MISSING: 'You can set your phone number at Amazon.com, under log-in and security.',
  ERROR: 'Uh Oh. Looks like something went wrong.',
  API_FAILURE: 'There was an error with the API. Please try again.',
  GOODBYE: 'Bye! Thanks for using the Guru Skill!',
  UNHANDLED: 'This skill doesn\'t support that. Please ask something else.',
  HELP: 'You can use this skill by asking something like: Provide me colleges in state, city and type public/private',
  STOP: 'Bye! Thanks for using the Guru Skill!',
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    // Name retrieval process
    const consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
    console.log(consentToken)
    // if (!consentToken) {

    //  }

    const userID = handlerInput.requestEnvelope.context.System.user.userId;
    let name, uEmail;
    try {
      const client = handlerInput.serviceClientFactory.getUpsServiceClient();
      name = await client.getProfileName();
      console.log(name)
      uEmail = await client.getProfileEmail();

      if (!name) {
        return handlerInput.responseBuilder
          .speak(messages.NAME_MISSING)
          .getResponse();
      }
      if (!uEmail) {
        return handlerInput.responseBuilder
          .speak(messages.EMAIL_MISSING)
          .getResponse();
      }
      //     console.log('Name successfully retrieved, now responding to user. ' + name);


      // return response;
    } catch (error) {
      if (error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse();
      }
      if (error.name !== 'ServiceError') {
        const e = handlerInput.responseBuilder.speak(messages.ERROR).getResponse();
        console.log(`---Error handled: ${error.message}`)
        // return response;
      }
      throw error;
    }

    // *************************************************************************

    let result = await dynamoDB.getMyCollegeItem(userID);
    let speechText = '';

    //console.log(result.length)
    // welcome message
    if (!name) {
      speechText = messages.NAME_MISSING;
      // response = handlerInput.responseBuilder.speak(messages.NAME_MISSING).getResponse();
    } else {
      speechText = name + ', ' + messages.WELCOME;
      // response = handlerInput.responseBuilder.speak(messages.NAME_AVAILABLE + name).getResponse();
    }

    // welcome screen message
    let displayText = speechText

    result = await dynamoDB.putMyCollegeItem(userID)

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
    const userID = handlerInput.requestEnvelope.context.System.user.userId;

    if (state && city && schoolType) {
      const resultPut = await dynamoDB.putMyCollegeItem(userID, state, city, schoolType)

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
      // })
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
    let speechText = messages.HELP;

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
  .withApiClient(new Alexa.DefaultApiClient())
  .addRequestHandlers(LaunchRequestHandler,
    SearchIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)

  .lambda();
