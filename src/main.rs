mod serialize;
mod simulation;
mod vector;

use serialize::Trace;
use simulation::{Body, Simulation};

use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, post, web};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Request {
    steps: usize,
    time_step: f64,
    sample_rate: usize,
    starting_bodies: Vec<Body>,
}
#[derive(Serialize, Deserialize)]
struct Response {
    traces: Vec<Trace>,
}

#[post("/simulate")]
async fn simulate(body: web::Json<Request>) -> impl Responder {
    let data: Request = body.into_inner();
    let mut simulation = Simulation::new(data.starting_bodies, data.time_step, data.sample_rate);

    for _ in 0..=data.steps {
        simulation.calculate_next_step();
    }

    let traces = serialize::from_simulation(simulation);
    serialize::save_file(&traces, "last_sim.json");
    HttpResponse::Ok().json(Response { traces })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::permissive();

        App::new().service(simulate).wrap(cors)
    })
    .bind(("0.0.0.0", 6378))
    .unwrap()
    .run()
    .await
}
