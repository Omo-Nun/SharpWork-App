import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { BookingState, Role } from '@prisma/client';

const router = Router();

// Create Booking (Customer Only)
router.post('/', authenticate, requireRole(['CUSTOMER']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { artisanId, description, price } = req.body;
  const customerId = req.user.userId;

  try {
    const booking = await prisma.booking.create({
      data: {
        customerId,
        artisanId,
        state: BookingState.PENDING,
        description,
        price,
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update Booking Status (State Machine)
router.patch('/:id/state', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { state } = req.body; // Target state
  const user = req.user;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // State Machine Validation Logic
    const currentState = booking.state;
    let validTransition = false;

    if (user.role === Role.ARTISAN && booking.artisanId === user.userId) {
      if (currentState === BookingState.PENDING && state === BookingState.ACCEPTED) validTransition = true;
      if (currentState === BookingState.ACCEPTED && state === BookingState.IN_PROGRESS) validTransition = true;
      if (currentState === BookingState.IN_PROGRESS && state === BookingState.COMPLETED) validTransition = true;
    } else if (user.role === Role.CUSTOMER && booking.customerId === user.userId) {
      if (currentState === BookingState.COMPLETED && state === BookingState.REVIEWED) validTransition = true;
    }

    if (!validTransition) {
      res.status(400).json({ error: `Invalid state transition from ${currentState} to ${state} for role ${user.role}` });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { state },
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
