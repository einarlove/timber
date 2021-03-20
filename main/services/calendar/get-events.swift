import EventKit

let eventStore = EKEventStore()
let calendars = eventStore.calendars(for: .event)

struct Entry: Codable {
    var id: String
    var title: String
    var organizer: String?
    var startDate: String
    var endDate: String
    var calendar: String
    var recurring: Bool
}

var array: [Entry] = []

func getCalendarEvents() {
    let iso8601DateFormatter = ISO8601DateFormatter()
    iso8601DateFormatter.formatOptions = [.withInternetDateTime, .withDashSeparatorInDate, .withFullDate, .withFractionalSeconds, .withColonSeparatorInTimeZone]

    let startDateString = ProcessInfo.processInfo.environment["START_DATE"]!
    let endDateString = ProcessInfo.processInfo.environment["END_DATE"]!
    let startDate = iso8601DateFormatter.date(from: startDateString)
    let endDate = iso8601DateFormatter.date(from: endDateString)


    for calendar in calendars {
        if calendar.title == "einar@unfold.no" {
            let predicate = eventStore.predicateForEvents(withStart: startDate!, end: endDate!, calendars: [calendar])
            let events = eventStore.events(matching: predicate)

            for event in events {
                let participant = event.organizer?.isCurrentUser ?? false ? event.organizer : event.attendees?.first { $0.isCurrentUser }
                let participating = participant?.participantStatus == EKParticipantStatus.accepted
                let entry = Entry(
                    id: event.eventIdentifier!,
                    title: event.title!,
                    organizer: event.organizer?.name!,
                    startDate: iso8601DateFormatter.string(from: event.startDate!),
                    endDate: iso8601DateFormatter.string(from: event.endDate!),
                    calendar: calendar.title,
                    recurring: event.recurrenceRules != nil
                )

                if participating {
                    array.append(entry)
                }
            }
        }
    }

    let encoder = JSONEncoder()

    if let jsonData = try? encoder.encode(array) {
        let json = String(data: jsonData, encoding: String.Encoding.utf8)
        print(json!)
    }
}

switch EKEventStore.authorizationStatus(for: .event) {
  case .authorized:
      getCalendarEvents()

  case .denied:
      print("Access denied")

  case .notDetermined:
      eventStore.requestAccess(to: .event, completion:
          {(granted: Bool, error: Error?) -> Void in
              if granted {
                  getCalendarEvents()
              } else {
                  print("Access denied")
              }
      })

      print("Not Determined")
  default:
      print("Case Default")
}

