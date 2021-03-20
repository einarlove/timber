import EventKit
import SwiftUI

let eventStore = EKEventStore()
let calendars = eventStore.calendars(for: .event)

struct Calendar: Codable {
    var name: String
    var color: String
    var source: String
}

func getCalendars() {
    for calendar in calendars {
        if calendar.title == "einar@unfold.no" {
        }
    }

    let data = calendars.map { (calendar) -> Calendar in
        return Calendar(
            name: calendar.title,
            color: getHexFromColor(color: calendar.color),
            source: calendar.source.title
        )
    }

    let encoder = JSONEncoder()

    if let jsonData = try? encoder.encode(data) {
        let json = String(data: jsonData, encoding: String.Encoding.utf8)
        print(json!)
    }
}

switch EKEventStore.authorizationStatus(for: .event) {
    case .authorized:
        getCalendars()

    case .denied:
        print("Access denied")

    case .notDetermined:
        eventStore.requestAccess(to: .event, completion:
            {(granted: Bool, error: Error?) -> Void in
                if granted {
                    getCalendars()
                } else {
                    print("Access denied")
                }
        })

        print("Not Determined")
    default:
        print("Case Default")
}

func getHexFromColor(color: NSColor) -> String {
    var r:CGFloat = 0
    var g:CGFloat = 0
    var b:CGFloat = 0
    var a:CGFloat = 0

    color.getRed(&r, green: &g, blue: &b, alpha: &a)

    let rgb:Int = (Int)(r*255)<<16 | (Int)(g*255)<<8 | (Int)(b*255)<<0

    return NSString(format:"#%06x", rgb) as String
}
