import { Module } from '@nestjs/common';
import { GameChatService } from './services/game_chat/game_chat.service';
import { DatabaseModule } from 'src/database/database.module';
import { MessageService } from 'src/database/services';
import { ChatLogicService } from './services/chat_logic/chat_logic.service';
import { GameChatEventsService } from './services/game_chat_events/game_chat_events.service';

@Module({
  imports: [DatabaseModule],
  providers: [GameChatService, ChatLogicService, GameChatEventsService, MessageService],
  exports: [GameChatService, ChatLogicService, GameChatEventsService, MessageService],
})
export class GameChatModule { }
