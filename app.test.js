const request = require('supertest')
const app = require('./app')

describe("Express API", () => {
    it('GET /liste --> array salle', () => {
        return request(app)
        .get('/liste')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        roomname : expect.any(String),
                        roomsubname : expect.any(String),
                        nombretable : expect.any(Number),
                        nombresiege : expect.any(Number),
                        nombresiegetable : expect.any(Number),
                        statut : expect.any(Boolean),
                        id_reserveur : expect.any(String)
                    })
                ])
            )
        })
    });
    it('GET /salle/id --> specific salle by ID', () => {
        return request(app)
        .get('/salle/65782524729b37ae39e1f554')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .then((response) => {
            expect(response.body).toEqual(
                expect.objectContaining({
                    roomname : expect.any(String),
                    roomsubname : expect.any(String),
                    nombretable : expect.any(Number),
                    nombresiege : expect.any(Number),
                    nombresiegetable : expect.any(Number),
                    statut : expect.any(Boolean),
                    id_reserveur : expect.any(String)
                })
            )
        })
    });
    it('GET /salle/id --> 404 if not found', () => {
        return request(app)
        .get('/salle/888888888888888888')
        .expect(404)
    });
    // it('POST /api/ajoutsalle --> create a new salle', () => {
    //     return request(app)
    //     .post('/api/ajoutsalle')
    //     .send({
    //         roomname : 'nom de salle',
    //         roomsubname : 'proprietaire salle',
    //         nombretable : 5,
    //         nombresiege : 10,
    //         nombresiegetable : 2,
    //         statut : false,
    //         pp : 'image',
    //         id_reserveur : 'id du reservateur'
    //     })
    //     .expect('Content-Type', 'application/json; charset=utf-8')
    //     .expect(201)
    //     .then((response) => {
    //         expect(response.body).toEqual(
    //             expect.objectContaining({
    //                 result : expect.any(String)
    //             })
    //         )
    //     })
    // });
    it('POST /api/ajoutsalle --> validate a new salle', () => {
        return request(app)
        .post('/api/ajoutsalle')
        .send({
            roomname : 123,
            // roomsubname : 'proprietaire salle',
            // nombretable : 2,
            // nombresiege : 4,
            // nombresiegetable : 2,
            // statut : true,
            // id_reserveur : 'id du resrvateur'
        })
        .expect(402)
    });
});