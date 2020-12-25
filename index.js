/* eslint-disable max-len */
const { getCollege } = require('./Models/apiIndex')
const { getMyCollegeItem, putMyCollegeItem } = require('./Models/index')

const Alexa = require('ask-sdk-core')

// skill name
const appName = 'Guru'

// Code for messages
// code for the handlers
const PERMISSIONS = ['alexa::profile:name:read', 'alexa::profile:email:read']
const messages = (type, val1) => {
  switch (type) {
    case 'WELCOME':
      return val1 + ' , welcome to Guru, virtual guide for selecting dream college.'
    case 'WELCOMEEDIT':
      {
        let tResult = ''

        // eslint-disable-next-line max-len
        if (((val1.Item['city'] === undefined) || (val1.Item['city'] === '')) && ((val1.Item['state'] === undefined) || (val1.Item['state'] === ''))) {
          tResult = ' What do you want to ask? You can search colleges by state, city, school type and school name'
        }
        else if (val1.Item['city'] && val1.Item['state']) {
          // eslint-disable-next-line max-len
          tResult = ' You searched for city ' + val1.Item['city'] + ' in ' + val1.Item['state'] + ' for ' + val1.Item['schoolType'] + ' schools. You want same search or you want new search.'
        }

        // console.log(`WELCOMEEDIT : ${tResult}`)

        return tResult
      }
    case 'NewSearch':
      return 'You can start new search by telling state, city and school type?'
    case 'SameSearch':
      // return ' You searching for city ' + val1.Item['city'] + ' in ' + val1.Item['state'] + ' for ' + val1.Item['schoolType'] + ' schools.'
      // let tResult = ''
      if (val1.length > 0) {
        for (let i = 0; i < val1.length; i++) {
          tResult = tResult + '' + (i + 1).toString() + ' ' + val1[i]['school.name']
        }
      }
      else if (val1.length === 0) {
        tResult = 'There is no colleges '
      }

      return tResult

    case 'Search':
      let tResult = ''

      if (val1.length > 0) {
        for (let i = 0; i < val1.length; i++) {
          tResult = tResult + '' + (i + 1).toString() + ' ' + val1[i]['school.name']
        }
      }
      else if (val1.length === 0) {
        tResult = 'There is no colleges '
      }

      return tResult

    case 'WHAT_DO_YOU_WANT':
      return 'What do you want to ask?'
    case 'NOTIFY_MISSING_PERMISSIONS':
      return 'Please enable Customer Profile permissions in the Amazon Alexa app.'
    case 'NAME_MISSING':
      return 'You can set your name either in the Alexa app under calling and messaging, or you can set it at Amazon.com, under log-in and security.'
    case 'EMAIL_MISSING':
      return 'You can set your email at Amazon.com, under log-in and security.'
    case 'NUMBER_MISSING':
      return 'You can set your phone number at Amazon.com, under log-in and security.'
    case 'ERROR':
      return 'Uh Oh. Looks like something went wrong.'
    case 'API_FAILURE':
      return 'There was an error with the API. Please try again.'
    case 'GOODBYE':
      return 'Bye! Thanks for using the Guru Skill!'
    case 'UNHANDLED':
      return 'This skill doesn\'t support that. Please ask something else.'
    case 'HELP':
      return 'You can use this skill by asking something like: Provide me colleges in state, city and type public/private'
    case 'STOP':
      return 'Bye! Thanks for using the Guru Skill!'
  }
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  async handle(handlerInput) {
    // Name retrieval process
    // const consentToken = handlerInput.requestEnvelope.context.System.apiAccessToken;

    const userID = handlerInput.requestEnvelope.context.System.user.userId
    let name
    let uEmail

    try {
      const client = handlerInput.serviceClientFactory.getUpsServiceClient()

      name = await client.getProfileName()
      uEmail = await client.getProfileEmail()

      if (!name) {
        return handlerInput.responseBuilder
          .speak(messages('NAME_MISSING', ''))
          .getResponse()
      }
      if (!uEmail) {
        return handlerInput.responseBuilder
          .speak(messages('EMAIL_MISSING', ''))
          .getResponse()
      }

      // return response;
    }
    catch (error) {
      if (error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(messages('NOTIFY_MISSING_PERMISSIONS', ''))
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse()
      }

      if (error.name !== 'ServiceError') {
        const e = handlerInput.responseBuilder.speak(messages('ERROR', '')).getResponse()

        console.log(`---Error handled: ${error.message}`)
        // return response;
      }
      throw error
    }

    // *************************************************************************

    let result = await getMyCollegeItem(userID)
    let intent = handlerInput.requestEnvelope
    let speechText = ''

    // welcome message
    if (!name) {
      speechText = messages('NAME_MISSING', '')
    } else {
      speechText = messages('WELCOME', name)
      speechText = speechText + messages('WELCOMEEDIT', result)
    }

    // welcome screen message
    let displayText = speechText

    // result = await putMyCollegeItem(userID)

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(appName, displayText)
      .getResponse()
  }
}

// implement custom handlers
const searchTypeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'searchTypeIntent'
  },
  async handle(handlerInput) {
    let intent = handlerInput.requestEnvelope.request.intent
    let speechText = ''
    let displayText = ''

    let searchType = intent.slots['searchType'].resolutions.resolutionsPerAuthority[0].values[0].value.id
    // console.log(searchType);

    if (searchType === '0') {
      const userID = handlerInput.requestEnvelope.context.System.user.userId

      await putMyCollegeItem(userID, '', '', '')
      speechText = messages('NewSearch', '')
      displayText = speechText
    }
    else if (searchType === '1') {
      const userID = handlerInput.requestEnvelope.context.System.user.userId
      let result = await getMyCollegeItem(userID)

      speechText = ''
      const city = result.Item['city'] // result['school.city'];
      const state = result.Item['state']
      const schoolType = result.Item['schoolType']

      result = await getCollege(city, state, schoolType) // results.school.name

      speechText = 'Same search result found for ' + schoolType + ' colleges in ' + city + ' in the state of ' + state + '. \n '
      speechText = speechText + messages('Search', result)
      // displayText = speechText
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      // .reprompt(reprompt)
      .withSimpleCard(searchType) // (appName.displayText)
      .getResponse()
  }

}

const SearchIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'searchIntent'
  },
  async handle(handlerInput) {
    console.log('searchIntent')
    let speechText = ''
    let displayText = ''
    let intent = handlerInput.requestEnvelope.request.intent
    let city = intent.slots.city.value
    let state = intent.slots.state.value
    let schoolType = intent.slots.schoolType.value
    // let searchType =  (intent.slots.searchType.value === undefined) ? '': intent.slots.searchType.value;
    const userID = handlerInput.requestEnvelope.context.System.user.userId


    if (state && city && schoolType) {
      const resultPut = await putMyCollegeItem(userID, state, city, schoolType)

      const result = await getCollege(city, state, schoolType) // results.school.name

      speechText = 'I found ' + result.length.toString() + ' colleges in ' + city + ' in the state of ' + state + '. \n '
      speechText = speechText + messages('Search', result)
      displayText = speechText

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(appName.displayText)
        .getResponse()
      // })
    } else {
      return handlerInput.responseBuilder
        .addDelegateDirective(intent)
        .getResponse()
    }
  }
}


// end Custom handlers

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    // help text for your skill
    let speechText = messages('HELP', '')

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(appName, speechText)
      .getResponse()
  }
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    let speechText = messages('Goodbye', '')

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(appName, speechText)
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    // any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse()
  }
}

// Lambda handler function
// Remember to add custom request handlers here
exports.handler = Alexa.SkillBuilders.custom()
  .withApiClient(new Alexa.DefaultApiClient())
  .addRequestHandlers(LaunchRequestHandler,
    SearchIntentHandler,
    searchTypeIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)

  .lambda()
