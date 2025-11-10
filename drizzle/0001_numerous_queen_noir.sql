CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`tabela` varchar(100) NOT NULL,
	`operacao` enum('CREATE','UPDATE','DELETE') NOT NULL,
	`registroId` int NOT NULL,
	`dadosAntes` text,
	`dadosDepois` text,
	`ipAddress` varchar(50),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `embalagem_localizacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`embalagemId` int NOT NULL,
	`localizacaoId` int NOT NULL,
	`quantidade` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `embalagem_localizacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `embalagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`material` varchar(100) NOT NULL,
	`produto` varchar(255) NOT NULL,
	`marca` varchar(255) NOT NULL,
	`pais` varchar(100) NOT NULL,
	`codigoBarras` varchar(50),
	`tipoEmbalagem` varchar(100),
	`seraUtilizadoEm` text,
	`observacoes` text,
	`deletado` boolean NOT NULL DEFAULT false,
	`dataDelecao` timestamp,
	`usuarioDelecaoId` int,
	`motivoDelecao` text,
	`usuarioCriadorId` int NOT NULL,
	`usuarioAtualizadorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `embalagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipes_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `fotos_embalagem` (
	`id` int AUTO_INCREMENT NOT NULL,
	`embalagemId` int NOT NULL,
	`linkDrive` text NOT NULL,
	`descricao` text,
	`ordem` int NOT NULL DEFAULT 1,
	`usuarioUploadId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fotos_embalagem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `localizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galpao` varchar(100) NOT NULL,
	`andar` varchar(50) NOT NULL,
	`prateleira` varchar(50) NOT NULL,
	`caixaSigla` varchar(50) NOT NULL,
	`qrCodeData` text,
	`quantidadeEmbalagens` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localizacoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `localizacoes_caixaSigla_unique` UNIQUE(`caixaSigla`)
);
--> statement-breakpoint
CREATE TABLE `usuario_equipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`equipeId` int NOT NULL,
	`papelNaEquipe` enum('super_admin','admin','gerente','membro'),
	`dataEntrada` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usuario_equipe_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','gerente','visualizador') NOT NULL DEFAULT 'visualizador';--> statement-breakpoint
ALTER TABLE `users` ADD `ativo` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `embalagem_localizacao` ADD CONSTRAINT `embalagem_localizacao_embalagemId_embalagens_id_fk` FOREIGN KEY (`embalagemId`) REFERENCES `embalagens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `embalagem_localizacao` ADD CONSTRAINT `embalagem_localizacao_localizacaoId_localizacoes_id_fk` FOREIGN KEY (`localizacaoId`) REFERENCES `localizacoes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `embalagens` ADD CONSTRAINT `embalagens_usuarioDelecaoId_users_id_fk` FOREIGN KEY (`usuarioDelecaoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `embalagens` ADD CONSTRAINT `embalagens_usuarioCriadorId_users_id_fk` FOREIGN KEY (`usuarioCriadorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `embalagens` ADD CONSTRAINT `embalagens_usuarioAtualizadorId_users_id_fk` FOREIGN KEY (`usuarioAtualizadorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fotos_embalagem` ADD CONSTRAINT `fotos_embalagem_embalagemId_embalagens_id_fk` FOREIGN KEY (`embalagemId`) REFERENCES `embalagens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fotos_embalagem` ADD CONSTRAINT `fotos_embalagem_usuarioUploadId_users_id_fk` FOREIGN KEY (`usuarioUploadId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usuario_equipe` ADD CONSTRAINT `usuario_equipe_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usuario_equipe` ADD CONSTRAINT `usuario_equipe_equipeId_equipes_id_fk` FOREIGN KEY (`equipeId`) REFERENCES `equipes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `usuario_idx` ON `auditoria` (`usuarioId`);--> statement-breakpoint
CREATE INDEX `tabela_idx` ON `auditoria` (`tabela`);--> statement-breakpoint
CREATE INDEX `operacao_idx` ON `auditoria` (`operacao`);--> statement-breakpoint
CREATE INDEX `embalagem_idx` ON `embalagem_localizacao` (`embalagemId`);--> statement-breakpoint
CREATE INDEX `localizacao_idx` ON `embalagem_localizacao` (`localizacaoId`);--> statement-breakpoint
CREATE INDEX `material_idx` ON `embalagens` (`material`);--> statement-breakpoint
CREATE INDEX `pais_idx` ON `embalagens` (`pais`);--> statement-breakpoint
CREATE INDEX `deletado_idx` ON `embalagens` (`deletado`);--> statement-breakpoint
CREATE INDEX `tipo_embalagem_idx` ON `embalagens` (`tipoEmbalagem`);--> statement-breakpoint
CREATE INDEX `embalagem_idx` ON `fotos_embalagem` (`embalagemId`);--> statement-breakpoint
CREATE INDEX `galpao_idx` ON `localizacoes` (`galpao`);--> statement-breakpoint
CREATE INDEX `caixa_sigla_idx` ON `localizacoes` (`caixaSigla`);--> statement-breakpoint
CREATE INDEX `usuario_idx` ON `usuario_equipe` (`usuarioId`);--> statement-breakpoint
CREATE INDEX `equipe_idx` ON `usuario_equipe` (`equipeId`);