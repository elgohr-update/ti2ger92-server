var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var validator = require('validator')

var config = require('../config.js')

const weeksSince = date => {
  // 604800000 = milliseconds in a week
  return (new Date() - date) / 604800000
}

const minsSince = date => {
  // 60000 = milliseconds in a minute
  return (new Date() - date) / 60000
}

const tallyVolunteerPoints = volunteer => {
  let points = 0

  // +2 points if no past sessions
  if (!volunteer.numPastSessions) {
    points += 2
  }

  // +1 point if volunteer is from a partner org
  if (volunteer.volunteerPartnerOrg) {
    points += 1
  }

  // +1 point per 1 week since last notification
  if (volunteer.volunteerLastNotification) {
    points += weeksSince(new Date(volunteer.volunteerLastNotification.sentAt))
  } else {
    points += weeksSince(new Date(volunteer.createdAt))
  }

  // +1 point per 2 weeks since last session
  if (volunteer.volunteerLastSession) {
    points +=
      0.5 * weeksSince(new Date(volunteer.volunteerLastSession.createdAt))
  } else {
    points += weeksSince(new Date(volunteer.createdAt))
  }

  // -10000 points if notified recently
  if (
    volunteer.volunteerLastNotification &&
    minsSince(new Date(volunteer.volunteerLastNotification.sentAt)) < 5
  ) {
    points -= 10000
  }

  return parseFloat(points.toFixed(2))
}

// subdocument schema for each availability day
const availabilityDaySchema = new mongoose.Schema(
  {
    '12a': { type: Boolean, default: false },
    '1a': { type: Boolean, default: false },
    '2a': { type: Boolean, default: false },
    '3a': { type: Boolean, default: false },
    '4a': { type: Boolean, default: false },
    '5a': { type: Boolean, default: false },
    '6a': { type: Boolean, default: false },
    '7a': { type: Boolean, default: false },
    '8a': { type: Boolean, default: false },
    '9a': { type: Boolean, default: false },
    '10a': { type: Boolean, default: false },
    '11a': { type: Boolean, default: false },
    '12p': { type: Boolean, default: false },
    '1p': { type: Boolean, default: false },
    '2p': { type: Boolean, default: false },
    '3p': { type: Boolean, default: false },
    '4p': { type: Boolean, default: false },
    '5p': { type: Boolean, default: false },
    '6p': { type: Boolean, default: false },
    '7p': { type: Boolean, default: false },
    '8p': { type: Boolean, default: false },
    '9p': { type: Boolean, default: false },
    '10p': { type: Boolean, default: false },
    '11p': { type: Boolean, default: false }
  },
  { _id: false }
)

const availabilitySchema = new mongoose.Schema(
  {
    Sunday: { type: availabilityDaySchema, default: availabilityDaySchema },
    Monday: { type: availabilityDaySchema, default: availabilityDaySchema },
    Tuesday: { type: availabilityDaySchema, default: availabilityDaySchema },
    Wednesday: { type: availabilityDaySchema, default: availabilityDaySchema },
    Thursday: { type: availabilityDaySchema, default: availabilityDaySchema },
    Friday: { type: availabilityDaySchema, default: availabilityDaySchema },
    Saturday: { type: availabilityDaySchema, default: availabilityDaySchema }
  },
  { _id: false }
)

var userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return validator.isEmail(v)
        },
        message: '{VALUE} is not a valid email'
      }
    },
    password: { type: String, select: false },

    verified: {
      type: Boolean,
      default: false
    },
    verificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    registrationCode: { type: String, select: false },
    volunteerPartnerOrg: String,

    // Profile data
    firstname: { type: String, required: [true, 'First name is required.'] },
    lastname: { type: String, required: [true, 'Last name is required.'] },
    nickname: String,
    serviceInterests: [String],
    picture: String,
    birthdate: String,
    gender: String,
    race: [String],
    groupIdentification: [String],
    computerAccess: [String],
    preferredTimes: [String],
    phone: {
      type: String,
      required: [
        function() {
          return this.isVolunteer
        },
        'Phone number is required.'
      ]
      // @todo: server-side validation of international phone format
    },

    approvedHighschool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School'
      /* TODO validate approvedHighschool.isApproved: true
       * if this.isVolunteer is false */
    },
    currentGrade: String,
    expectedGraduation: String,
    difficultAcademicSubject: String,
    difficultCollegeProcess: [String],
    highestLevelEducation: [String],
    hasGuidanceCounselor: String,
    favoriteAcademicSubject: String,
    gpa: String,
    collegeApplicationsText: String,
    commonCollegeDocs: [String],
    college: String,
    academicInterestsText: String,
    testScoresText: String,
    advancedCoursesText: String,
    extracurricularActivitesText: String,
    heardFrom: String,
    referred: String,
    preferredContactMethod: [String],
    availability: { type: availabilitySchema, default: availabilitySchema },
    timezone: String,
    pastSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],

    certifications: {
      algebra: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      geometry: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      trigonometry: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      precalculus: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      calculus: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      applications: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      essays: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      },
      planning: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        }
      }
    },

    // User status
    isVolunteer: {
      type: Boolean,
      default: false
    },
    isFailsafeVolunteer: {
      type: Boolean,
      default: false,
      validate: {
        validator: function(v) {
          return this.isVolunteer || !v
        },
        message: 'A student cannot be a failsafe volunteer'
      }
    },
    /* Fake Users
     * These aren't the same as Test Users; they still receive Twilio texts, etc
     * Fake Users are real, fully functional accounts that we decide not to track because they've been
     * identified as accounts that aren't actual students/volunteers; just people trying out the service.
     */
    isFakeUser: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isTestUser: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: {
      virtuals: true
    },

    toObject: {
      virtuals: true
    }
  }
)

// Given a user record, strip out sensitive data for public consumption
userSchema.methods.parseProfile = function() {
  return {
    _id: this._id,
    email: this.email,
    verified: this.verified,
    firstname: this.firstname,
    lastname: this.lastname,
    nickname: this.nickname,
    picture: this.picture,
    isVolunteer: this.isVolunteer,
    isAdmin: this.isAdmin,
    referred: this.referred,
    createdAt: this.createdAt,

    birthdate: this.birthdate,
    serviceInterests: this.serviceInterests,
    gender: this.gender,
    race: this.race,
    groupIdentification: this.groupIdentification,
    computerAccess: this.computerAccess,
    preferredTimes: this.preferredTimes,
    phone: this.phone,
    preferredContactMethod: this.preferredContactMethod,
    availability: this.availability,
    timezone: this.timezone,

    highschoolName: this.highschoolName,
    currentGrade: this.currentGrade,
    expectedGraduation: this.expectedGraduation,
    difficultAcademicSubject: this.difficultAcademicSubject,
    difficultCollegeProcess: this.difficultCollegeProcess,
    highestLevelEducation: this.highestLevelEducation,
    hasGuidanceCounselor: this.hasGuidanceCounselor,
    gpa: this.gpa,
    college: this.college,
    collegeApplicationsText: this.collegeApplicationsText,
    commonCollegeDocs: this.commonCollegeDocs,
    academicInterestsText: this.academicInterestsText,
    testScoresText: this.testScoresText,
    advancedCoursesText: this.advancedCoursesText,
    extracurricularActivitesText: this.extracurricularActivitesText,
    favoriteAcademicSubject: this.favoriteAcademicSubject,
    heardFrom: this.heardFrom,
    isFakeUser: this.isFakeUser,
    certifications: this.certifications,
    phonePretty: this.phonePretty,
    numPastSessions: this.numPastSessions,
    numVolunteerSessionHours: this.numVolunteerSessionHours,
    mathCoachingOnly: this.mathCoachingOnly
  }
}

// Placeholder method to support asynchronous profile parsing
userSchema.methods.getProfile = function(cb) {
  cb(null, this.parseProfile())
}

userSchema.methods.hashPassword = function(password, cb) {
  bcrypt.genSalt(config.saltRounds, function(err, salt) {
    if (err) {
      cb(err)
    } else {
      bcrypt.hash(password, salt, cb)
    }
  })
}

userSchema.methods.verifyPassword = function(candidatePassword, cb) {
  var user = this

  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err)
    } else if (isMatch) {
      return cb(null, user)
    } else {
      cb(null, false)
    }
  })
}

// Populates user document with the fields from the School document
// necessary to retrieve the high school name
userSchema.methods.populateForHighschoolName = function(cb) {
  return this.populate('approvedHighschool', 'nameStored SCH_NAME', cb)
}

// Populates user document with the fields from pastSessions documents
// necessary to retrieve numVolunteerSessionHours
userSchema.methods.populateForVolunteerStats = function(cb) {
  return this.populate(
    'pastSessions',
    'createdAt volunteerJoinedAt endedAt',
    cb
  )
}

// regular expression that accepts multiple valid U. S. phone number formats
// see http://regexlib.com/REDetails.aspx?regexp_id=58
// modified to ignore trailing/leading whitespace and disallow alphanumeric characters
const PHONE_REGEX = /^\s*(?:[0-9](?: |-)?)?(?:\(?([0-9]{3})\)?|[0-9]{3})(?: |-)?(?:([0-9]{3})(?: |-)?([0-9]{4}))\s*$/

// virtual type for phone number formatted for readability
userSchema
  .virtual('phonePretty')
  .get(function() {
    if (!this.phone) {
      return null
    }

    // @todo: support better formatting of international numbers in phonePretty
    if (this.phone[0] === '+') {
      return this.phone
    }

    // first test user's phone number to see if it's a valid U.S. phone number
    var matches = this.phone.match(PHONE_REGEX)
    if (!matches) {
      return null
    }

    // ignore first element of matches, which is the full regex match,
    // and destructure remaining portion
    var [, area, prefix, line] = matches
    // accepted phone number format in database
    var reStrict = /^([0-9]{3})([0-9]{3})([0-9]{4})$/
    if (!this.phone.match(reStrict)) {
      // autocorrect phone number format
      var oldPhone = this.phone
      this.phone = `${area}${prefix}${line}`
      this.save(function(err, user) {
        if (err) {
          console.log(err)
        } else {
          console.log(`Phone number ${oldPhone} corrected to ${user.phone}.`)
        }
      })
    }
    return `${area}-${prefix}-${line}`
  })
  .set(function(v) {
    if (!v) {
      this.phone = v
    } else {
      // @todo: support better setting of international numbers in phonePretty
      if (v[0] === '+') {
        this.phone = `+${v.replace(/\D/g, '')}`
        return
      }

      // ignore first element of match result, which is the full match,
      // and destructure the remaining portion
      var [, area, prefix, line] = v.match(PHONE_REGEX) || []
      this.phone = `${area}${prefix}${line}`
    }
  })

userSchema.virtual('highschoolName').get(function() {
  if (this.approvedHighschool) {
    return this.approvedHighschool.name
  } else {
    return null
  }
})

userSchema.virtual('volunteerPointRank').get(function() {
  if (!this.isVolunteer) return null
  return tallyVolunteerPoints(this)
})

// Virtual that gets all notifications that this user has been sent
userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'volunteer',
  options: { sort: { sentAt: -1 } }
})

userSchema.virtual('volunteerLastSession', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'volunteer',
  justOne: true,
  options: { sort: { createdAt: -1 } }
})

userSchema.virtual('volunteerLastNotification', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'volunteer',
  justOne: true,
  options: { sort: { sentAt: -1 } }
})

userSchema.virtual('numPastSessions').get(function() {
  if (!this.pastSessions) {
    return 0
  }

  return this.pastSessions.length
})

userSchema.virtual('numVolunteerSessionHours').get(function() {
  if (!this.pastSessions || !this.pastSessions.length) {
    return 0
  }

  // can't calculate when pastSessions hasn't been .populated()
  if (!this.pastSessions[0].createdAt) {
    return null
  }

  const totalMilliseconds = this.pastSessions.reduce((totalMs, pastSession) => {
    // early skip if session is missing necessary props
    if (!(pastSession.volunteerJoinedAt && pastSession.endedAt)) {
      return totalMs
    }

    const volunteerJoinDate = new Date(pastSession.volunteerJoinedAt)
    const sessionEndDate = new Date(pastSession.endedAt)
    let millisecondDiff = sessionEndDate - volunteerJoinDate

    // if session was longer than 5 hours, it was probably an old glitch
    if (millisecondDiff > 18000000) {
      return totalMs
    }

    // skip if for some reason the volunteer joined after the session ended
    if (millisecondDiff < 0) {
      return totalMs
    }

    return millisecondDiff + totalMs
  }, 0)

  // milliseconds in hour = (60,000 * 60) = 3,600,000
  const hoursDiff = (totalMilliseconds / 3600000).toFixed(2)

  return hoursDiff
})

userSchema.virtual('mathCoachingOnly').get(function() {
  if (!this.isVolunteer) return null
  if (!this.volunteerPartnerOrg) return false

  const orgManifest = config.orgManifests[this.volunteerPartnerOrg]
  return !!orgManifest && !!orgManifest['mathCoachingOnly']
})

// Static method to determine if a registration code is valid
userSchema.statics.checkCode = function(code) {
  const volunteerCodes = config.VOLUNTEER_CODES.split(',')

  const isVolunteerCode = volunteerCodes.some(volunteerCode => {
    return volunteerCode.toUpperCase() === code.toUpperCase()
  })

  return isVolunteerCode
}

module.exports = mongoose.model('User', userSchema)
