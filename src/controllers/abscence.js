import { StatusCodes } from "http-status-codes";
import {
  findAbsenceByUserId,
  createAbsence,
  updateAbsence,
  findAllAbsences,
  deleteAbsence
} from "../services/absence/abscence.service";
import { formatResponse } from "../utils/format";
import { findUserById } from "../services/auth/auth.service";

export const createAbsenceController = async (req, res) => {
  const {
    reason, startDate, endDate
  } = req.body;
  const { id } = req.user;
  const user = await findUserById(id);
  if (!user) {
    return formatResponse(res, StatusCodes.NOT_FOUND, null, "User not found");
  }
  const userId = user.id;
  const absence = await createAbsence({
    reason,
    startDate,
    endDate,
    userId
  });
  if (!absence) {
    return formatResponse(
      res,
      StatusCodes.BAD_REQUEST,
      null,
      "Error while creating absence"
    );
  }
  return formatResponse(res, StatusCodes.CREATED, absence);
};

export const updateAbsenceController = async (req, res) => {
  const { id } = req.params;
  const {
    reason, startDate, endDate, userId
  } = req.body;
  const absence = await findAbsenceByUserId(id);
  if (!absence) {
    return formatResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      "Absence not found"
    );
  }
  const updatedAbsence = await updateAbsence(id, {
    reason,
    startDate,
    endDate,
    userId
  });
  if (!updatedAbsence) {
    return formatResponse(
      res,
      StatusCodes.BAD_REQUEST,
      null,
      "Error while updating absence"
    );
  }
  return formatResponse(res, StatusCodes.OK, updatedAbsence);
};

export const deleteAbsenceController = async (req, res) => {
  const { id } = req.params;
  const absence = await findAbsenceByUserId(id);
  if (!absence) {
    return formatResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      "Absence not found"
    );
  }
  const deletedAbsence = await deleteAbsence(id);
  if (!deletedAbsence) {
    return formatResponse(
      res,
      StatusCodes.BAD_REQUEST,
      null,
      "Error while deleting absence"
    );
  }
  return formatResponse(res, StatusCodes.OK, {
    message: "Absence deleted successfully"
  });
};

export const getAllAbsencesController = async (req, res) => {
  const absences = await findAllAbsences({
    include: "user"
  });
  if (absences.length === 0) {
    return formatResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      "No absences found"
    );
  }
  return formatResponse(res, StatusCodes.OK, absences);
};

export const getAbsenceByUserIdController = async (req, res) => {
  const { id } = req.params;
  const absence = await findAbsenceByUserId(id, {
    include: "user"
  });
  if (!absence) {
    return formatResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      "Absence not found"
    );
  }
  return formatResponse(res, StatusCodes.OK, absence);
};

export const approveDenyAbsenceController = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "approved" || status !== "denied" || status !== "pending") {
    return formatResponse(
      res,
      StatusCodes.BAD_REQUEST,
      null,
      "Invalid absence status. Please provide 'approved' or 'denied'."
    );
  }

  const absence = await findAbsenceByUserId(id);
  if (!absence) {
    return formatResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      "Absence not found"
    );
  }

  const updatedAbsence = await updateAbsence(id, { status });

  if (!updatedAbsence) {
    return formatResponse(
      res,
      StatusCodes.BAD_REQUEST,
      null,
      "Error while updating absence"
    );
  }

  return formatResponse(res, StatusCodes.OK, updatedAbsence);
};
