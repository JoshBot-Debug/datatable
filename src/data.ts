import { fakerEN } from "@faker-js/faker";

export interface Data { id: number; fullName: string; firstName: string; middleName: string; lastName: string; isActive: boolean; dateOfBirth: string; createdAt: string; loginTime: string; email: string; profileImage: string; website: string; phone: string; about: string; status: string }


export const status = ["online", "offline", "available", "unavailable", "dnd"]


function generateData() {
  const generated: Data[] = [];

  for (let i = 0; i < (new Array(10000)).length; i++) {

    const isActive = Math.random() > 0.5;
    const isMale = Math.random() > 0.5;
    const firstName = fakerEN.person.firstName(isMale ? "male" : "female");
    const middleName = fakerEN.person.middleName(isMale ? "male" : "female");
    const lastName = fakerEN.person.lastName(isMale ? "male" : "female");
    const fullName = `${firstName} ${middleName} ${lastName}`;

    generated.push({
      id: i + 1,
      fullName,
      firstName,
      middleName,
      lastName,
      isActive,
      dateOfBirth: fakerEN.date.birthdate({ min: 21, max: 60, mode: "age" }).toISOString(),
      createdAt: fakerEN.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-08-01T00:00:00.000Z' }).toISOString(),
      loginTime: fakerEN.date.anytime().toLocaleTimeString(),
      email: `${fakerEN.internet.displayName({ firstName, lastName })}@gmail.com`,
      profileImage: fakerEN.image.avatar(),
      website: fakerEN.internet.url(),
      phone: fakerEN.phone.number("##########"),
      about: fakerEN.lorem.paragraph(),
      status: fakerEN.helpers.arrayElement(status)
    })
  }

  return generated;
}