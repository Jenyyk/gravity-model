mod serialize;
mod simulation;
mod vector;

use simulation::{Body, Simulation};
use vector::float2;

fn main() {
    let starting_bodies = vec![
        Body {
            position: float2::new(0_f64, 0_f64),
            mass: 5000000000_f64,
            velocity: float2::empty(),
            acceleration: float2::empty(),
        },
        Body {
            position: float2::new(70_f64, -120_f64),
            mass: 10_f64,
            velocity: float2::new(-0.02_f64, 0_f64),
            acceleration: float2::empty(),
        },
        Body {
            position: float2::new(80_f64, 80_f64),
            mass: 10_f64,
            velocity: float2::new(-0.02_f64, 0.02_f64),
            acceleration: float2::empty(),
        },
        Body {
            position: float2::new(20_f64, 0_f64),
            mass: 10_f64,
            velocity: float2::new(0_f64, 0.18_f64),
            acceleration: float2::empty(),
        },
    ];

    let mut simulation = Simulation::new(starting_bodies, 0.05_f64, 5000);

    for i in 0..=50000000 {
        simulation.calculate_next_step();
        if i % 100000 == 0 {
            simulation.cleanup();
        }
    }
    simulation.cleanup();
    simulation.log_last_state();

    let traces = serialize::from_simulation(simulation);
    serialize::save_file(&traces);
}
