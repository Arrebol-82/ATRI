export type NewsSection = {
  heading: string
  lines: string[]
}

export type NewsItem = {
  id: number
  date: string
  title: string
  thumb: string
  image: string
  lead: string
  paragraphs: string[]
  sections: NewsSection[]
}

export const newsList: NewsItem[] = [
  {
    id: 1,
    date: '2026.03.19',
    title: 'Special event detail information has been released',
    thumb: '/images/tx1.jpg',
    image: '/images/sy1.jpg',
    lead: 'The latest information for the ATRI special event has been released.',
    paragraphs: [
      'The event will feature a talk session, production notes, and a small exhibition area themed around the world of ATRI.',
      'Additional ticket and bonus information will be announced through the official news area as details are confirmed.'
    ],
    sections: [
      {
        heading: 'Event outline',
        lines: [
          'Date: 2026.08.16',
          'Venue: Special hall',
          'Contents: cast talk, production materials, and limited exhibition'
        ]
      },
      {
        heading: 'Ticket information',
        lines: [
          'Priority application tickets will be included with selected products.',
          'Application details and reception period will be announced later.'
        ]
      }
    ]
  },
  {
    id: 2,
    date: '2026.03.06',
    title: 'Special event confirmed',
    thumb: '/images/tx2.jpg',
    image: '/images/sy2.jpg',
    lead: 'A new special event for fans of ATRI has been confirmed.',
    paragraphs: [
      'The event is planned as a place to look back on memorable scenes and enjoy behind-the-scenes stories from the project.',
      'Further information about guests, merchandise, and ticket sales will be posted in the news list.'
    ],
    sections: [
      {
        heading: 'Schedule',
        lines: [
          'Main program details are currently in preparation.',
          'Ticket reception is planned to open after the full schedule is announced.'
        ]
      }
    ]
  },
  {
    id: 3,
    date: '2026.03.03',
    title: 'Birthday visual campaign has started',
    thumb: '/images/tx3.jpg',
    image: '/images/sy3.jpg',
    lead: 'A limited birthday visual campaign is now available.',
    paragraphs: [
      'The campaign includes a commemorative illustration and themed social posts for the character celebration.',
      'Fans can check the campaign period and participation rules from this article.'
    ],
    sections: [
      {
        heading: 'Campaign details',
        lines: [
          'Commemorative visual release',
          'Social media participation campaign',
          'Limited digital materials'
        ]
      }
    ]
  },
  {
    id: 4,
    date: '2026.02.16',
    title: 'All-night screening project announced',
    thumb: '/images/tx4.jpg',
    image: '/images/sy4.jpg',
    lead: 'A special screening project has been announced for selected episodes.',
    paragraphs: [
      'The screening will give viewers a chance to experience the story in a theater-like environment.',
      'More details about seat reservations and venue rules will be shared before the event date.'
    ],
    sections: [
      {
        heading: 'Screening notes',
        lines: [
          'Selected episodes will be screened together.',
          'Please check venue guidance before attending.'
        ]
      }
    ]
  },
  {
    id: 5,
    date: '2026.02.13',
    title: 'Blu-ray purchase campaign information',
    thumb: '/images/tx5.jpg',
    image: '/images/sy5.jpg',
    lead: 'A purchase campaign for related Blu-ray products has been announced.',
    paragraphs: [
      'Customers who purchase eligible products may receive limited campaign benefits.',
      'Benefit availability can differ by store, so please confirm the target shop list before purchase.'
    ],
    sections: [
      {
        heading: 'Eligible products',
        lines: [
          'Selected Blu-ray releases',
          'Campaign bonuses are available while supplies last.'
        ]
      }
    ]
  },
  {
    id: 6,
    date: '2026.01.19',
    title: 'Staff and cast talk event information',
    thumb: '/images/story1.png',
    image: '/images/story2.png',
    lead: 'A talk event with staff and cast members has been announced.',
    paragraphs: [
      'The program will cover character memories, production episodes, and selected audience questions.',
      'Final guest information and event notices will be posted when ready.'
    ],
    sections: [
      {
        heading: 'Program',
        lines: [
          'Opening talk',
          'Production discussion',
          'Closing message'
        ]
      }
    ]
  }
]
