from faker import Faker

fake = Faker()

TEST_USER_DATA = {
    "email": fake.email(),
    "first_name": fake.first_name(),
    "last_name": fake.last_name(),
    "password": fake.password(),
}
