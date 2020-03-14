const UserAction = require('../models/UserAction')
const { USER_ACTION } = require('../constants')
const getSupercategory = require('../utils/getSupercategory')
const getDeviceFromUserAgent = require('../utils/getDeviceFromUserAgent')
const userAgentParser = require('ua-parser-js')

const createQuizAction = async (userId, quizSubcategory, action) => {
  const userActionDoc = new UserAction({
    actionType: USER_ACTION.TYPE.QUIZ,
    action,
    user: userId,
    quizSubcategory: quizSubcategory.toUpperCase(),
    quizCategory: getSupercategory(quizSubcategory)
  })

  return userActionDoc.save()
}

const createSessionAction = async (userId, sessionId, userAgent, action) => {
  const userAgentParserResult = userAgentParser(userAgent)
  const { device, browser, os } = userAgentParserResult
  const userActionDoc = new UserAction({
    user: userId,
    session: sessionId,
    actionType: USER_ACTION.TYPE.SESSION,
    action,
    device: device.vendor || getDeviceFromUserAgent(userAgent),
    browser: browser.name || '',
    browserVersion: browser.version || '',
    operatingSystem: os.name || '',
    operatingSystemVersion: os.version || ''
  })

  return userActionDoc.save()
}

const createProfileAction = async (userId, action) => {
  const userActionDoc = new UserAction({
    user: userId,
    actionType: USER_ACTION.TYPE.PROFILE,
    action
  })
  return userActionDoc.save()
}

const startedQuiz = (userId, quizCategory) => {
  return createQuizAction(userId, quizCategory, USER_ACTION.QUIZ.STARTED)
}

const passedQuiz = (userId, quizCategory) => {
  return createQuizAction(userId, quizCategory, USER_ACTION.QUIZ.PASSED)
}

const failedQuiz = (userId, quizCategory) => {
  return createQuizAction(userId, quizCategory, USER_ACTION.QUIZ.FAILED)
}

const requestedSession = (userId, sessionId, userAgent) => {
  return createSessionAction(
    userId,
    sessionId,
    userAgent,
    USER_ACTION.SESSION.REQUESTED
  )
}

const repliedYesToSession = (userId, sessionId, userAgent) => {
  return createSessionAction(
    userId,
    sessionId,
    userAgent,
    USER_ACTION.SESSION.REPLIED_YES
  )
}

const joinedSession = (userId, sessionId, userAgent) => {
  return createSessionAction(
    userId,
    sessionId,
    userAgent,
    USER_ACTION.SESSION.JOINED
  )
}

const rejoinedSession = (userId, sessionId, userAgent) => {
  return createSessionAction(
    userId,
    sessionId,
    userAgent,
    USER_ACTION.SESSION.REJOINED
  )
}

const updatedProfile = userId => {
  return createProfileAction(userId, USER_ACTION.PROFILE.UPDATED_PROFILE)
}

const updatedAvailability = userId => {
  return createProfileAction(userId, USER_ACTION.PROFILE.UPDATED_AVAILABILITY)
}

module.exports = {
  startedQuiz,
  passedQuiz,
  failedQuiz,
  requestedSession,
  joinedSession,
  rejoinedSession,
  repliedYesToSession,
  updatedProfile,
  updatedAvailability
}
