from database import Base, SessionLocal, engine
import models


def _normalize_tags(tags: list[str]) -> list[str]:
    # Keep tag values consistent across seeded data.
    normalized: list[str] = []
    seen: set[str] = set()
    for tag in tags:
        cleaned = tag.strip().lower()
        if cleaned and cleaned not in seen:
            normalized.append(cleaned)
            seen.add(cleaned)
    return normalized


def _tags_to_string(tags: list[str]) -> str:
    return ','.join(_normalize_tags(tags))


def seed_opportunities() -> None:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    opportunities = [
        {
            'title': 'Backend Engineering Intern',
            'company_or_organizer': 'Zoho',
            'type': 'internship',
            'description': 'Work on scalable backend services and API development using Python and SQL.',
            'tags': ['python', 'backend', 'sql'],
            'application_link': 'https://www.zoho.com/careers/',
        },
        {
            'title': 'Software Engineering Intern',
            'company_or_organizer': 'Freshworks',
            'type': 'internship',
            'description': 'Build customer-facing product features with a focus on reliability and performance.',
            'tags': ['web', 'backend', 'teamwork'],
            'application_link': 'https://www.freshworks.com/company/careers/',
        },
        {
            'title': 'Data Engineering Intern',
            'company_or_organizer': 'TATA',
            'type': 'internship',
            'description': 'Support analytics pipelines and data ingestion workflows for enterprise teams.',
            'tags': ['data', 'python', 'etl'],
            'application_link': 'https://www.tata.com/careers',
        },
        {
            'title': 'Full Stack Intern',
            'company_or_organizer': 'Infosys',
            'type': 'internship',
            'description': 'Collaborate on modern web apps, from frontend UI to backend services.',
            'tags': ['web', 'javascript', 'backend'],
            'application_link': 'https://www.infosys.com/careers/',
        },
        {
            'title': 'Mobile Engineering Intern',
            'company_or_organizer': 'Flipkart',
            'type': 'internship',
            'description': 'Build high-quality mobile experiences for large-scale commerce products.',
            'tags': ['mobile', 'android', 'ios'],
            'application_link': 'https://www.flipkartcareers.com/',
        },
        {
            'title': 'Backend Platform Intern',
            'company_or_organizer': 'Ola',
            'type': 'internship',
            'description': 'Help improve backend platforms powering real-time mobility services.',
            'tags': ['backend', 'systems', 'python'],
            'application_link': 'https://ola.careers/',
        },
        {
            'title': 'Smart India Hackathon',
            'company_or_organizer': 'SIH',
            'type': 'hackathon',
            'description': 'Solve real-world problems with a multidisciplinary team in a national hackathon.',
            'tags': ['innovation', 'teamwork', 'open-source'],
            'application_link': 'https://www.sih.gov.in/',
        },
        {
            'title': 'HackWithInfy',
            'company_or_organizer': 'Infosys',
            'type': 'hackathon',
            'description': 'Compete in Infosys flagship hackathon with mentorship and hiring opportunities.',
            'tags': ['competitive', 'backend', 'web'],
            'application_link': 'https://www.infosys.com/careers/hackwithinfy.html',
        },
        {
            'title': 'Flipkart Grid',
            'company_or_organizer': 'Flipkart',
            'type': 'hackathon',
            'description': 'Work on impactful industry problem statements with Flipkart leaders.',
            'tags': ['data', 'ml', 'innovation'],
            'application_link': 'https://unstop.com/competitions/flipkart-grid',
        },
        {
            'title': 'Google Summer of Code',
            'company_or_organizer': 'Google',
            'type': 'fellowship',
            'description': 'Contribute to open-source projects with guidance from global mentors.',
            'tags': ['open-source', 'python', 'web'],
            'application_link': 'https://summerofcode.withgoogle.com/',
        },
        {
            'title': 'MLH Fellowship',
            'company_or_organizer': 'Major League Hacking',
            'type': 'fellowship',
            'description': 'Join remote pods to build open-source projects and expand your network.',
            'tags': ['open-source', 'teamwork', 'web'],
            'application_link': 'https://fellowship.mlh.io/',
        },
        {
            'title': 'ACM ICPC Regional',
            'company_or_organizer': 'ACM',
            'type': 'competition',
            'description': 'Competitive programming contest emphasizing algorithms and problem solving.',
            'tags': ['algorithms', 'teamwork', 'competitive'],
            'application_link': 'https://icpc.global/',
        },
    ]

    try:
        created_count = 0
        for item in opportunities:
            existing = (
                session.query(models.Opportunity)
                .filter(
                    models.Opportunity.title == item['title'],
                    models.Opportunity.company_or_organizer == item['company_or_organizer'],
                )
                .first()
            )
            if existing:
                continue

            opportunity = models.Opportunity(
                title=item['title'],
                company_or_organizer=item['company_or_organizer'],
                type=item['type'],
                description=item['description'],
                tags=_tags_to_string(item['tags']),
                application_link=item['application_link'],
            )
            session.add(opportunity)
            created_count += 1

        session.commit()
        skipped = len(opportunities) - created_count
        print(f'Seed complete: {created_count} created, {skipped} skipped')
    finally:
        session.close()


if __name__ == '__main__':
    seed_opportunities()
