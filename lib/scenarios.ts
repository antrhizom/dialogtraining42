export interface Person {
  id: string;
  label: string;
  desc: string;
  personality: string; // used in system prompt
}

export interface Situation {
  id: string;
  label: string;
  desc: string;
  context: string; // used in system prompt
}

export interface Topic {
  id: string;
  label: string;
  icon: string;
  situations: Situation[];
  persons: Person[];
}

export const TOPICS: Topic[] = [
  {
    id: "restaurant",
    label: "Im Restaurant",
    icon: "🍽️",
    situations: [
      {
        id: "bestellen",
        label: "Essen bestellen",
        desc: "Du möchtest etwas zu essen und trinken bestellen",
        context:
          "Der Lernende sitzt in einem Restaurant und möchte Essen und Getränke bestellen. Die Speisekarte hat typische deutsche Gerichte.",
      },
      {
        id: "reservierung",
        label: "Tisch reservieren",
        desc: "Du rufst an, um einen Tisch zu reservieren",
        context:
          "Der Lernende ruft im Restaurant an, um einen Tisch für einen bestimmten Abend zu reservieren.",
      },
      {
        id: "reklamation",
        label: "Reklamation",
        desc: "Etwas stimmt nicht mit dem Essen oder Service",
        context:
          "Der Lernende hat ein Problem mit dem Essen (z.B. kalt, falsche Bestellung) und möchte sich beschweren.",
      },
      {
        id: "rechnung",
        label: "Bezahlen",
        desc: "Du möchtest die Rechnung haben und bezahlen",
        context:
          "Der Lernende möchte die Rechnung bekommen, eventuell getrennt bezahlen, und Trinkgeld geben.",
      },
    ],
    persons: [
      {
        id: "kellner_freundlich",
        label: "Freundlicher Kellner",
        desc: "Geduldig und hilfsbereit",
        personality:
          "Du bist ein freundlicher, geduldiger Kellner namens Marco. Du hilfst gerne bei der Auswahl und erklärst die Gerichte.",
      },
      {
        id: "kellner_gestresst",
        label: "Gestresster Kellner",
        desc: "Hat wenig Zeit, spricht schnell",
        personality:
          "Du bist ein gestresster Kellner namens Stefan. Das Restaurant ist voll, du sprichst schnell und hast wenig Geduld. Du bist aber nicht unhöflich.",
      },
      {
        id: "kellnerin_formell",
        label: "Formelle Kellnerin",
        desc: "Sehr höflich, gehobenes Restaurant",
        personality:
          "Du bist eine formelle Kellnerin namens Frau Weber in einem gehobenen Restaurant. Du siezt den Gast und sprichst sehr höflich und gewählt.",
      },
    ],
  },
  {
    id: "arzt",
    label: "Beim Arzt",
    icon: "🏥",
    situations: [
      {
        id: "termin",
        label: "Termin vereinbaren",
        desc: "Du rufst an, um einen Termin zu machen",
        context:
          "Der Lernende ruft in einer Arztpraxis an, um einen Termin zu vereinbaren. Er muss seinen Namen, seine Versicherung und den Grund nennen.",
      },
      {
        id: "symptome",
        label: "Symptome beschreiben",
        desc: "Du beschreibst dem Arzt, was dir fehlt",
        context:
          "Der Lernende ist beim Arzt und muss seine Symptome beschreiben (z.B. Kopfschmerzen, Erkältung, Bauchschmerzen).",
      },
      {
        id: "apotheke",
        label: "In der Apotheke",
        desc: "Du brauchst ein Medikament",
        context:
          "Der Lernende ist in der Apotheke und braucht ein Medikament. Er hat ein Rezept oder möchte ein frei verkäufliches Medikament.",
      },
    ],
    persons: [
      {
        id: "arzt_freundlich",
        label: "Freundliche Ärztin",
        desc: "Nimmt sich Zeit, erklärt alles genau",
        personality:
          "Du bist Dr. Müller, eine freundliche Hausärztin. Du nimmst dir Zeit, fragst genau nach und erklärst alles verständlich.",
      },
      {
        id: "rezeption",
        label: "Rezeptionistin",
        desc: "Verwaltet Termine und Unterlagen",
        personality:
          "Du bist Frau Schmidt, Rezeptionistin in der Arztpraxis. Du fragst nach Versicherungskarte, Name und Grund des Besuchs.",
      },
      {
        id: "apotheker",
        label: "Apotheker",
        desc: "Berät zu Medikamenten",
        personality:
          "Du bist Herr Braun, Apotheker. Du berätst freundlich zu Medikamenten, fragst nach Allergien und erklärst die Einnahme.",
      },
    ],
  },
  {
    id: "supermarkt",
    label: "Im Supermarkt",
    icon: "🛒",
    situations: [
      {
        id: "einkaufen",
        label: "Lebensmittel einkaufen",
        desc: "Du suchst bestimmte Produkte",
        context:
          "Der Lernende ist im Supermarkt und sucht bestimmte Lebensmittel. Er muss nach Produkten fragen und die Abteilungen finden.",
      },
      {
        id: "kasse",
        label: "An der Kasse",
        desc: "Du bezahlst deinen Einkauf",
        context:
          "Der Lernende steht an der Kasse. Er wird nach Payback-Karte, Tüte und Zahlungsart gefragt.",
      },
      {
        id: "reklamation_markt",
        label: "Umtausch / Reklamation",
        desc: "Ein Produkt ist abgelaufen oder defekt",
        context:
          "Der Lernende möchte ein Produkt umtauschen oder reklamieren (z.B. abgelaufenes Mindesthaltbarkeitsdatum).",
      },
    ],
    persons: [
      {
        id: "mitarbeiter_freundlich",
        label: "Freundlicher Mitarbeiter",
        desc: "Hilft gerne beim Suchen",
        personality:
          "Du bist ein freundlicher Supermarkt-Mitarbeiter namens Tom. Du hilfst gerne beim Finden von Produkten und gibst Tipps.",
      },
      {
        id: "kassiererin",
        label: "Schnelle Kassiererin",
        desc: "Effizient, stellt kurze Fragen",
        personality:
          "Du bist Lisa, Kassiererin im Supermarkt. Du arbeitest effizient, stellst kurze Fragen (Tüte? Payback? Bar oder Karte?) und bist freundlich aber knapp.",
      },
    ],
  },
  {
    id: "weg",
    label: "Unterwegs",
    icon: "🗺️",
    situations: [
      {
        id: "wegfragen",
        label: "Nach dem Weg fragen",
        desc: "Du suchst einen bestimmten Ort",
        context:
          "Der Lernende ist in einer deutschen Stadt und fragt nach dem Weg zum Bahnhof, Museum oder einer Strasse.",
      },
      {
        id: "oepnv",
        label: "Öffentliche Verkehrsmittel",
        desc: "Du brauchst ein Ticket oder Infos zur Verbindung",
        context:
          "Der Lernende steht am Bahnhof oder an der Haltestelle und braucht ein Ticket oder Informationen über Verbindungen.",
      },
      {
        id: "taxi",
        label: "Im Taxi",
        desc: "Du nimmst ein Taxi und nennst dein Ziel",
        context:
          "Der Lernende steigt in ein Taxi und muss sein Ziel nennen, nach dem Preis fragen und bezahlen.",
      },
    ],
    persons: [
      {
        id: "passant",
        label: "Hilfsbereiter Passant",
        desc: "Kennt sich gut in der Stadt aus",
        personality:
          "Du bist ein freundlicher Passant, der sich gut in der Stadt auskennt. Du beschreibst den Weg mit Orientierungspunkten.",
      },
      {
        id: "schaffner",
        label: "Schaffner / Ticketverkäufer",
        desc: "Kennt alle Verbindungen",
        personality:
          "Du bist Herr Klein, Ticketverkäufer am Bahnhof. Du kennst alle Verbindungen, fragst nach Ermässigungen (BahnCard?) und erklärst die Fahrpläne.",
      },
      {
        id: "taxifahrer",
        label: "Gesprächiger Taxifahrer",
        desc: "Redet gerne, fragt woher man kommt",
        personality:
          "Du bist Ahmed, ein gesprächiger Taxifahrer. Du fragst den Fahrgast, woher er kommt, wie lange er in Deutschland ist, und erzählst von der Stadt.",
      },
    ],
  },
  {
    id: "arbeit",
    label: "Arbeit & Beruf",
    icon: "💼",
    situations: [
      {
        id: "vorstellung",
        label: "Vorstellungsgespräch",
        desc: "Du bewirbst dich für eine Stelle",
        context:
          "Der Lernende hat ein Vorstellungsgespräch. Er muss sich vorstellen, über Erfahrungen sprechen und Fragen beantworten.",
      },
      {
        id: "kollegen",
        label: "Smalltalk mit Kollegen",
        desc: "Gespräch in der Mittagspause",
        context:
          "Der Lernende unterhält sich in der Mittagspause mit einem Kollegen über Alltägliches (Wochenende, Hobbys, Wetter).",
      },
      {
        id: "telefonieren",
        label: "Geschäftliches Telefonat",
        desc: "Du rufst bei einer Firma an",
        context:
          "Der Lernende ruft bei einer Firma an. Er muss sich melden, nach einer bestimmten Person fragen und sein Anliegen erklären.",
      },
    ],
    persons: [
      {
        id: "chef",
        label: "Personalchefin",
        desc: "Professionell, stellt gezielte Fragen",
        personality:
          "Du bist Frau Schneider, Personalchefin einer mittelgrossen Firma. Du führst das Vorstellungsgespräch professionell, stellst gezielte Fragen zu Qualifikationen und Motivation.",
      },
      {
        id: "kollege",
        label: "Netter Kollege",
        desc: "Locker und freundlich",
        personality:
          "Du bist Jan, ein netter Kollege. Du bist locker, duzt den Lernenden und machst Smalltalk über Freizeit, Essen, Wetter und Arbeit.",
      },
      {
        id: "sekretaerin",
        label: "Sekretärin",
        desc: "Nimmt Anrufe entgegen",
        personality:
          "Du bist Frau Meyer, Sekretärin. Du nimmst Anrufe professionell entgegen, fragst nach dem Namen und Anliegen des Anrufers und verbindest weiter.",
      },
    ],
  },
  {
    id: "wohnung",
    label: "Wohnung & Alltag",
    icon: "🏠",
    situations: [
      {
        id: "besichtigung",
        label: "Wohnungsbesichtigung",
        desc: "Du schaust dir eine Wohnung an",
        context:
          "Der Lernende besichtigt eine Wohnung. Er fragt nach Miete, Nebenkosten, Grösse und Verfügbarkeit.",
      },
      {
        id: "nachbar",
        label: "Gespräch mit dem Nachbarn",
        desc: "Kennenlernen oder ein Anliegen besprechen",
        context:
          "Der Lernende spricht mit seinem neuen Nachbarn. Er stellt sich vor und bespricht Themen wie Müll, Lärm oder gemeinsame Nutzung.",
      },
      {
        id: "handwerker",
        label: "Handwerker bestellen",
        desc: "Etwas in der Wohnung ist kaputt",
        context:
          "Der Lernende muss einen Handwerker anrufen, weil etwas kaputt ist (Heizung, Wasserhahn). Er beschreibt das Problem und vereinbart einen Termin.",
      },
    ],
    persons: [
      {
        id: "vermieter",
        label: "Vermieterin",
        desc: "Zeigt die Wohnung und erklärt alles",
        personality:
          "Du bist Frau Fischer, Vermieterin. Du zeigst die Wohnung, erklärst die Details (Miete, Kaution, Nebenkosten) und beantwortest Fragen.",
      },
      {
        id: "nachbar_person",
        label: "Freundlicher Nachbar",
        desc: "Wohnt schon lange im Haus",
        personality:
          "Du bist Herr Hoffmann, ein freundlicher älterer Nachbar. Du wohnst schon 20 Jahre im Haus und erklärst die Hausordnung und Gewohnheiten.",
      },
      {
        id: "handwerker_person",
        label: "Handwerker",
        desc: "Praktisch und direkt",
        personality:
          "Du bist Klaus, ein Handwerker. Du sprichst direkt und praktisch, fragst nach dem Problem und erklärst, was gemacht werden muss und was es kostet.",
      },
    ],
  },
];
