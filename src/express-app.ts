import express, { Request, Response, Express } from "express";
import ApiLayer from "./api";
import morgan from "morgan";
import helmet from "helmet";
import amqp from "amqplib";
import QueueConsumers from "./queue";
import {
	FANOUT_EXCHANGE_TYPE,
	DIRECT_EXCHANGE_TYPE,
	SUPER_ADMIN_EXCHANGE,
	CREATE_ADMIN_QUEUE,
	DEACTIVATE_ADMIN_QUEUE,
	ACTIVATE_ADMIN_QUEUE,
	UPDATE_ADMIN_QUEUE,
	CREATE_ADMIN_KEY,
	DEACTIVATE_ADMIN_KEY,
	ACTIVATE_ADMIN_KEY,
	UPDATE_ADMIN_KEY,
} from "./queue/types";

//in here we will setup the rabbitMQ

export default async (app: Express) => {
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.use(helmet());
	app.use(
		morgan(":method :url :status :res[content-length] - :response-time ms")
	);

	//use routes
	amqp.connect("amqp://localhost:5672").then(async (conn) => {
		const channel = await conn.createChannel();

		//testing of exchange

		//asset one exchange name SuperAdmin
		await channel.assertExchange(SUPER_ADMIN_EXCHANGE, DIRECT_EXCHANGE_TYPE);

        await channel.assertQueue(CREATE_ADMIN_QUEUE)

        await channel.assertQueue(UPDATE_ADMIN_QUEUE)

        await channel.assertQueue(ACTIVATE_ADMIN_QUEUE)

        await channel.assertQueue(DEACTIVATE_ADMIN_QUEUE)


		//bind some queues to this exchange
		await channel.bindQueue(CREATE_ADMIN_QUEUE, SUPER_ADMIN_EXCHANGE, CREATE_ADMIN_KEY);

		await channel.bindQueue(UPDATE_ADMIN_QUEUE, SUPER_ADMIN_EXCHANGE, UPDATE_ADMIN_KEY);

		await channel.bindQueue(
			DEACTIVATE_ADMIN_QUEUE,
			SUPER_ADMIN_EXCHANGE,
			DEACTIVATE_ADMIN_KEY
		);

		await channel.bindQueue(
			ACTIVATE_ADMIN_QUEUE,
			SUPER_ADMIN_EXCHANGE,
			ACTIVATE_ADMIN_KEY
		);

		ApiLayer.superAdminRoutes(app, channel);
		QueueConsumers(channel);
	});
	app.get("/", async (req: Request, res: Response) => {
		res.status(200).send("hello");
	});
};
